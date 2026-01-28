import { Check, getGrade, Recommendation, SCORING } from '@agent-pulse/shared';
import { createLogger } from '../lib/logger';
import { supabase } from '../lib/supabase';
import { smartScrape, scrapeWithFirecrawl } from '../scrapers/firecrawl';
import { basicFetch } from '../scrapers/basic';
import { extractSchemasSmartly, extractJsonLdSchemas, findOrganizationSchema, ExtractedSchema } from '../schema/extract';
import { validateProductSchema } from '../schema/validate';
import { checkBotAccess } from '../checks/discovery/botAccess';
import { checkProductSchema } from '../checks/discovery/productSchema';
import { checkSitemap } from '../checks/discovery/sitemap';
import { getPageSpeedMetrics, checkPageSpeed } from '../checks/performance/pageSpeed';
import { checkOfferSchema } from '../checks/transaction/offerSchema';
import { checkHttps } from '../checks/transaction/https';
import { checkOrganizationSchema, OrganizationCheckOptions } from '../checks/trust/organization';
import { checkReturnPolicySchema } from '../checks/trust/returnPolicy';
import { performDistributionChecks } from '../checks/distribution';
import { generateRecommendations } from './recommendations';

const log = createLogger('job:analyze');

export interface AnalyzeJobPayload {
  jobId: string;
  url: string;
}

export interface AnalyzeJobResult {
  success: boolean;
  analysisId?: string;
  error?: string;
}

// Check if URL is the homepage (root path)
function isHomepage(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/' || parsed.pathname === '';
  } catch {
    return false;
  }
}

// Fetch homepage and extract Organization schema
async function fetchHomepageOrgSchema(
  domain: string
): Promise<{ schemas: ExtractedSchema[]; html: string | null }> {
  const homepageUrl = domain; // domain already includes protocol (e.g., https://example.com)

  log.debug({ homepageUrl }, 'Fetching homepage for Organization schema fallback');

  try {
    // Try basic fetch first (Organization schema is usually in initial HTML)
    const basicResult = await basicFetch(homepageUrl, 8000);

    if (basicResult.html && basicResult.html.length > 500) {
      const schemas = extractJsonLdSchemas(basicResult.html);
      const hasOrg = findOrganizationSchema(schemas);

      if (hasOrg) {
        log.info({ homepageUrl, schemaCount: schemas.length }, 'Found Organization schema on homepage via basic fetch');
        return { schemas, html: basicResult.html };
      }
    }

    // If basic fetch didn't find Organization schema, try Firecrawl
    // (some sites render Organization schema via JS)
    try {
      const firecrawlResult = await scrapeWithFirecrawl(homepageUrl, undefined, 10000);

      if (firecrawlResult.html && firecrawlResult.html.length > 500) {
        const schemas = extractJsonLdSchemas(firecrawlResult.html);
        const hasOrg = findOrganizationSchema(schemas);

        if (hasOrg) {
          log.info({ homepageUrl, schemaCount: schemas.length }, 'Found Organization schema on homepage via Firecrawl');
          return { schemas, html: firecrawlResult.html };
        }
      }
    } catch (firecrawlError) {
      log.debug({ error: firecrawlError }, 'Firecrawl homepage fetch failed, using basic result');
    }

    // Return whatever we got from basic fetch
    const schemas = basicResult.html ? extractJsonLdSchemas(basicResult.html) : [];
    return { schemas, html: basicResult.html };

  } catch (error) {
    log.warn({ homepageUrl, error }, 'Failed to fetch homepage for Organization schema');
    return { schemas: [], html: null };
  }
}

// Update job progress in database
async function updateJobProgress(
  jobId: string,
  status: string,
  step: number,
  currentCheck?: string
) {
  const progress = {
    step,
    totalSteps: 5,
    currentCheck,
    completedChecks: [] as string[],
  };

  await supabase
    .from('analysis_jobs')
    .update({
      status,
      progress,
      started_at: step === 1 ? new Date().toISOString() : undefined,
    })
    .eq('id', jobId);

  log.debug({ jobId, status, step, currentCheck }, 'Job progress updated');
}

// Main analysis function
export async function runAnalysis(payload: AnalyzeJobPayload): Promise<AnalyzeJobResult> {
  const { jobId, url } = payload;
  const startTime = Date.now();

  log.info({ jobId, url }, 'Starting analysis job');

  try {
    // Step 1: Scraping
    await updateJobProgress(jobId, 'scraping', 1, 'Fetching page content...');

    const { html, metadata, firecrawlUsed } = await smartScrape(url);

    if (!html || html.length < 100) {
      throw new Error('Failed to fetch page content');
    }

    const domain = new URL(url).origin;

    // Step 2: Smart schema extraction (follows product links if needed)
    await updateJobProgress(jobId, 'analyzing', 2, 'Extracting schemas...');

    // Scraper function to pass to smart extraction for category page handling
    const scrapeProductPage = async (productUrl: string) => {
      try {
        const result = await scrapeWithFirecrawl(productUrl);
        return result.html ? { html: result.html } : null;
      } catch {
        return null;
      }
    };

    const smartSchemaResult = await extractSchemasSmartly(html, url, scrapeProductPage);
    const { schemas, schemaQuality } = smartSchemaResult;
    const productValidation = validateProductSchema(smartSchemaResult.productValidation.schema);

    log.info({
      schemaCount: schemas.length,
      schemaQuality: schemaQuality.level,
      hasProduct: productValidation.found,
      checkedProductPage: smartSchemaResult.checkedProductPage,
      sourceUrl: smartSchemaResult.sourceUrl,
      message: smartSchemaResult.message,
    }, 'Smart schema extraction complete');

    // Step 3: Run checks in parallel where possible
    await updateJobProgress(jobId, 'analyzing', 3, 'Running checks...');

    // Parallel: Bot access + Sitemap + PageSpeed
    const [botAccessResult, sitemapResult, pageSpeedMetrics] = await Promise.all([
      checkBotAccess(domain),
      checkSitemap(domain),
      getPageSpeedMetrics(url),
    ]);

    // Schema-based checks (sync, fast)
    const productSchema = smartSchemaResult.productValidation.schema;
    const productSchemaResult = checkProductSchema(schemas);
    const offerSchemaResult = checkOfferSchema(schemas, productSchema);
    const returnPolicyResult = checkReturnPolicySchema(schemas);
    const pageSpeedResult = checkPageSpeed(pageSpeedMetrics);
    const httpsResult = checkHttps(url);

    // R1 Organization check with homepage fallback
    let orgSchemaResult = checkOrganizationSchema(schemas, { source: 'product_page' });
    let homepageFetched = false;
    let homepageHtml: string | null = null;

    // If Organization not found on product page, try homepage
    if (!orgSchemaResult.validation.found && !isHomepage(url)) {
      log.info({ url, domain }, 'Organization schema not found on product page, checking homepage...');

      const homepageResult = await fetchHomepageOrgSchema(domain);
      homepageFetched = true;
      homepageHtml = homepageResult.html;

      // Check if homepage has Organization schema
      const homepageOrgSchema = findOrganizationSchema(homepageResult.schemas);
      if (homepageOrgSchema) {
        log.info({ domain, orgName: homepageOrgSchema.name }, 'Found Organization schema on homepage');
        orgSchemaResult = checkOrganizationSchema(homepageResult.schemas, { source: 'homepage' });
      } else {
        log.debug({ domain }, 'No Organization schema found on homepage either');
      }
    }

    // Distribution checks (async, can be slow)
    await updateJobProgress(jobId, 'analyzing', 4, 'Checking distribution...');

    const distributionResult = await performDistributionChecks(
      domain,
      html,
      botAccessResult.rawRobotsTxt,
      productValidation,
      schemaQuality
    );

    // Step 4: Calculate scores
    await updateJobProgress(jobId, 'scoring', 5, 'Calculating score...');

    const checks: Check[] = [
      botAccessResult.check,      // D1
      productSchemaResult.check,  // D2
      sitemapResult.check,        // D3
      pageSpeedResult.check,      // N1
      offerSchemaResult.check,    // T1
      httpsResult.check,          // T2
      ...distributionResult.checks, // P1-P7
      orgSchemaResult.check,      // R1
      returnPolicyResult.check,   // R2
    ];

    // Calculate scores
    // Note: performanceMax is dynamic - if PageSpeed API fails, maxScore=0 (check excluded)
    const discoveryScore = botAccessResult.check.score + productSchemaResult.check.score + sitemapResult.check.score;
    const performanceScore = pageSpeedResult.check.score;
    const performanceMax = pageSpeedResult.check.maxScore; // Dynamic: 0 if skipped, 15 if measured
    const transactionScore = offerSchemaResult.check.score + httpsResult.check.score;
    const distributionScore = distributionResult.totalScore;
    const trustScore = orgSchemaResult.check.score + returnPolicyResult.check.score;
    const totalScore = discoveryScore + performanceScore + transactionScore + distributionScore + trustScore;

    // Calculate max possible score (accounts for skipped checks)
    const maxPossibleScore = SCORING.discovery.max + performanceMax + SCORING.transaction.max + SCORING.distribution.max + SCORING.trust.max;

    // Calculate grade based on percentage of max possible score
    // This ensures fair grading even when some checks are skipped
    const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    const grade = getGrade(normalizedScore);

    // Generate recommendations
    const recommendations = generateRecommendations(checks, {
      D2: productValidation,
      T1: offerSchemaResult.validation,
      R1: orgSchemaResult.validation,
      R2: returnPolicyResult.validation,
    });

    const analysisDuration = Date.now() - startTime;

    log.info({
      totalScore,
      maxPossibleScore,
      normalizedScore,
      grade,
      discoveryScore,
      performanceScore,
      performanceMax,
      transactionScore,
      distributionScore,
      trustScore,
      pageSpeedSkipped: pageSpeedResult.check.status === 'skipped',
      durationMs: analysisDuration,
    }, 'Analysis scoring complete');

    // Save to database
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        url,
        domain: new URL(url).hostname,
        total_score: totalScore,
        grade,
        discovery_score: discoveryScore,
        discovery_max: SCORING.discovery.max,
        performance_score: performanceScore,
        performance_max: performanceMax, // Dynamic: 0 if skipped, 15 if measured
        transaction_score: transactionScore,
        transaction_max: SCORING.transaction.max,
        distribution_score: distributionScore,
        distribution_max: SCORING.distribution.max,
        trust_score: trustScore,
        trust_max: SCORING.trust.max,
        platform_detected: distributionResult.platformDetection.platform,
        platform_name: distributionResult.platformDetection.platform,
        feeds_found: distributionResult.feeds,
        protocol_compatibility: distributionResult.protocolReadiness,
        checks,
        recommendations,
        analysis_duration_ms: analysisDuration,
        job_id: jobId,
        scrape_metadata: {
          firecrawlUsed,
          smartExtraction: {
            checkedProductPage: smartSchemaResult.checkedProductPage,
            productPageUrl: smartSchemaResult.productPageUrl,
            sourceUrl: smartSchemaResult.sourceUrl,
            message: smartSchemaResult.message,
          },
          homepageFallback: {
            used: homepageFetched,
            foundOrgSchema: orgSchemaResult.check.data?.source === 'homepage',
          },
          ...metadata,
        },
      })
      .select('id')
      .single();

    if (insertError) {
      log.error({ error: insertError }, 'Failed to save analysis');
      throw new Error('Failed to save analysis results');
    }

    // Update job as completed
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'completed',
        analysis_id: analysis.id,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    log.info({ jobId, analysisId: analysis.id, totalScore }, 'Analysis job completed');

    return { success: true, analysisId: analysis.id };
  } catch (error: any) {
    log.error({ jobId, url, error: error.message }, 'Analysis job failed');

    // Update job as failed
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'failed',
        error: {
          code: error.name || 'UNKNOWN',
          message: error.message,
          retryable: true,
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return { success: false, error: error.message };
  }
}
