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
import { checkWebSiteSchema } from '../checks/discovery/websiteSchema';
import { checkServerResponseTime } from '../checks/discovery/serverResponseTime';
import { checkProductFeed } from '../checks/discovery/productFeed';
import { checkCommerceApi } from '../checks/discovery/commerceApi';
import { checkOrganizationSchema, OrganizationCheckOptions } from '../checks/trust/organization';
import { checkTrustSignals } from '../checks/trust/trustSignals';
import { checkUcpCompliance } from '../checks/transaction/ucpCompliance';
import { checkPaymentMethods } from '../checks/transaction/paymentMethods';
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

  log.info({ jobId, url }, 'Starting analysis job (v2 3-layer model)');

  try {
    // Step 1: Scraping (measure TTFB)
    await updateJobProgress(jobId, 'scraping', 1, 'Fetching page content...');

    const scrapeStart = Date.now();
    const { html, metadata, firecrawlUsed } = await smartScrape(url);
    const ttfbMs = Date.now() - scrapeStart;

    if (!html || html.length < 100) {
      throw new Error('Failed to fetch page content');
    }

    const domain = new URL(url).origin;

    // Step 2: Smart schema extraction (follows product links if needed)
    await updateJobProgress(jobId, 'analyzing', 2, 'Extracting schemas...');

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

    // Step 3: Run checks
    await updateJobProgress(jobId, 'analyzing', 3, 'Running checks...');

    // Parallel: Bot access + Sitemap
    const [botAccessResult, sitemapResult] = await Promise.all([
      checkBotAccess(domain),
      checkSitemap(domain),
    ]);

    // TTFB check (uses measurement from Step 1)
    const ttfbResult = checkServerResponseTime(ttfbMs);

    // Schema-based checks (sync, fast)
    const productSchema = smartSchemaResult.productValidation.schema;
    const productSchemaResult = checkProductSchema(schemas);
    const websiteSchemaResult = checkWebSiteSchema(schemas);
    const ucpResult = checkUcpCompliance(schemas, productSchema);
    const trustSignalsResult = checkTrustSignals(url, schemas);
    const paymentMethodsResult = checkPaymentMethods(html, domain);

    // T1 Organization check with homepage fallback
    let orgSchemaResult = checkOrganizationSchema(schemas, { source: 'product_page' });
    let homepageFetched = false;

    if (!orgSchemaResult.validation.found && !isHomepage(url)) {
      log.info({ url, domain }, 'Organization schema not found on product page, checking homepage...');

      const homepageResult = await fetchHomepageOrgSchema(domain);
      homepageFetched = true;

      const homepageOrgSchema = findOrganizationSchema(homepageResult.schemas);
      if (homepageOrgSchema) {
        log.info({ domain, orgName: homepageOrgSchema.name }, 'Found Organization schema on homepage');
        orgSchemaResult = checkOrganizationSchema(homepageResult.schemas, { source: 'homepage' });
      } else {
        log.debug({ domain }, 'No Organization schema found on homepage either');
      }
    }

    // Distribution signal checks (async)
    await updateJobProgress(jobId, 'analyzing', 4, 'Checking distribution signals...');

    const productFeedResult = await checkProductFeed(
      domain, html, botAccessResult.rawRobotsTxt, paymentMethodsResult.platformDetection
    );
    const commerceApiResult = await checkCommerceApi(
      domain, html, productValidation, schemaQuality
    );

    // Step 4: Calculate scores (3-layer model)
    await updateJobProgress(jobId, 'scoring', 5, 'Calculating score...');

    const checks: Check[] = [
      botAccessResult.check,        // D1 (7 pts)
      sitemapResult.check,          // D2 (5 pts)
      ttfbResult.check,             // D3 (3 pts)
      productSchemaResult.check,    // D4 (10 pts)
      websiteSchemaResult.check,    // D5 (5 pts)
      productFeedResult.check,      // D7 (4 pts)
      commerceApiResult.check,      // D9 (3 pts)
      orgSchemaResult.check,        // T1 (8 pts)
      trustSignalsResult.check,     // T2 (7 pts)
      ucpResult.check,              // X1 (10 pts)
      paymentMethodsResult.check,   // X4 (5 pts)
    ];

    // Layer scores
    const discoveryScore = botAccessResult.check.score
      + sitemapResult.check.score
      + ttfbResult.check.score
      + productSchemaResult.check.score
      + websiteSchemaResult.check.score
      + productFeedResult.check.score
      + commerceApiResult.check.score;

    const trustScore = orgSchemaResult.check.score
      + trustSignalsResult.check.score;

    const transactionScore = ucpResult.check.score
      + paymentMethodsResult.check.score;

    const totalScore = discoveryScore + trustScore + transactionScore;

    // Max possible = sum of all active check maxScores (67 in Phase 1)
    const maxPossibleScore = checks.reduce((sum, c) => sum + c.maxScore, 0);

    const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    const grade = getGrade(normalizedScore);

    // Generate recommendations
    const recommendations = generateRecommendations(checks, {
      D4: productValidation,
      X1: ucpResult.validation,
      T1: orgSchemaResult.validation,
      T2: trustSignalsResult.validation,
    });

    const analysisDuration = Date.now() - startTime;

    log.info({
      totalScore,
      maxPossibleScore,
      normalizedScore,
      grade,
      discoveryScore,
      trustScore,
      transactionScore,
      ttfbMs,
      durationMs: analysisDuration,
    }, 'Analysis scoring complete (v2 3-layer)');

    // Save to database
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        url,
        domain: new URL(url).hostname,
        total_score: totalScore,
        grade,
        scoring_model: 'v2_3layer',
        // 3-layer scores
        discovery_score: discoveryScore,
        discovery_max: SCORING.discovery.max, // 45
        trust_score: trustScore,
        trust_max: SCORING.trust.max,         // 25
        transaction_score: transactionScore,
        transaction_max: SCORING.transaction.max, // 30
        // Deprecated (v1 compat)
        performance_score: 0,
        performance_max: 0,
        distribution_score: 0,
        distribution_max: 0,
        // Metadata
        platform_detected: paymentMethodsResult.platformDetection.platform,
        platform_name: paymentMethodsResult.platformDetection.platform,
        feeds_found: productFeedResult.feeds,
        protocol_compatibility: commerceApiResult.protocolReadiness,
        checks,
        recommendations,
        analysis_duration_ms: analysisDuration,
        job_id: jobId,
        scrape_metadata: {
          firecrawlUsed,
          ttfbMs,
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
