import { Check, getGrade, Recommendation, SCORING } from '@agent-pulse/shared';
import { createLogger } from '../lib/logger';
import { supabase } from '../lib/supabase';
import { scrapeWithFirecrawl } from '../scrapers/firecrawl';
import { extractJsonLdSchemas, findProductSchema, findProductLinkOnPage, assessSchemaQuality, discoverProductUrlFromFeed, ExtractedSchema } from '../schema/extract';
import { validateProductSchema } from '../schema/validate';
import { checkBotAccess } from '../checks/discovery/botAccess';
import { checkProductSchema } from '../checks/discovery/productSchema';
import { checkSitemap } from '../checks/discovery/sitemap';
import { checkWebSiteSchema } from '../checks/discovery/websiteSchema';
import { checkFaqSchema } from '../checks/discovery/faqSchema';
import { checkServerResponseTime } from '../checks/discovery/serverResponseTime';
import { checkProductFeed } from '../checks/discovery/productFeed';
import { checkCommerceApi } from '../checks/discovery/commerceApi';
import { checkLlmsTxt } from '../checks/discovery/llmsTxt';
import { checkOrganizationSchema } from '../checks/trust/organization';
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
    // ==========================================
    // Step 1: Fetch content & measure TTFB
    // ==========================================
    await updateJobProgress(jobId, 'scraping', 1, 'Fetching page content...');

    // TTFB: lightweight HEAD request for server response time measurement
    let ttfbMs: number;
    try {
      const ttfbStart = Date.now();
      await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': 'AgentPulseBot/1.0' },
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
      });
      ttfbMs = Date.now() - ttfbStart;
    } catch {
      ttfbMs = 9999; // Server unreachable
    }

    const domain = new URL(url).origin;
    const urlIsHomepage = isHomepage(url);

    // Always fetch submitted URL via Firecrawl (needed for payment/platform detection)
    const firecrawlResult = await scrapeWithFirecrawl(url);
    const submittedHtml = firecrawlResult.html;
    const metadata = firecrawlResult.metadata;

    if (!submittedHtml || submittedHtml.length < 100) {
      throw new Error('Failed to fetch page content');
    }

    // Extract schemas from submitted URL (used for initial assessment)
    const submittedSchemas = extractJsonLdSchemas(submittedHtml);

    // ==========================================
    // Step 2: Explicit page separation
    //   Homepage  → D5 WebSite Schema, T1 Organization Schema
    //   Product   → D4 Product Schema, X1 UCP Compliance, T2 Return Policy
    // ==========================================
    await updateJobProgress(jobId, 'analyzing', 2, 'Extracting schemas...');

    // 2a: Homepage schemas (for D5, T1) — always fetched deterministically
    let homepageSchemas: ExtractedSchema[];
    if (urlIsHomepage) {
      homepageSchemas = submittedSchemas;
      log.info({ schemaCount: homepageSchemas.length }, 'Homepage schemas from submitted URL');
    } else {
      try {
        const homepageResult = await scrapeWithFirecrawl(domain, undefined, 15000);
        homepageSchemas = homepageResult.html ? extractJsonLdSchemas(homepageResult.html) : [];
        log.info({ schemaCount: homepageSchemas.length }, 'Homepage schemas fetched separately via Firecrawl');
      } catch (err) {
        log.warn({ error: err, domain }, 'Failed to fetch homepage via Firecrawl');
        homepageSchemas = [];
      }
    }

    // 2b: Product page schemas (for D4, X1, T2 return policy) — discovered deterministically
    let productSchemas: ExtractedSchema[];
    let productPageUrl: string | undefined;
    let productDiscoveryMethod = 'none';

    const submittedQuality = assessSchemaQuality(submittedSchemas);

    if (submittedQuality.hasProduct) {
      // Submitted URL has product data — use it directly
      productSchemas = submittedSchemas;
      productPageUrl = url;
      productDiscoveryMethod = 'submitted_url';
      log.info({ quality: submittedQuality.level }, 'Product schemas found on submitted URL');
    } else {
      productSchemas = [];

      // Try 1: Find product link on the submitted page and scrape it
      const productLink = findProductLinkOnPage(submittedHtml, url);
      if (productLink) {
        try {
          const productResult = await scrapeWithFirecrawl(productLink, undefined, 15000);
          if (productResult.html && productResult.html.length > 0) {
            const pageSchemas = extractJsonLdSchemas(productResult.html);
            if (assessSchemaQuality(pageSchemas).hasProduct) {
              productSchemas = pageSchemas;
              productPageUrl = productLink;
              productDiscoveryMethod = 'page_link';
              log.info({ productLink }, 'Product schemas found via page link');
            }
          }
        } catch (err) {
          log.warn({ productLink, error: err }, 'Failed to scrape product page from link');
        }
      }

      // Try 2: Discover product URL from feed/sitemap
      if (!assessSchemaQuality(productSchemas).hasProduct) {
        const feedProductUrl = await discoverProductUrlFromFeed(domain);
        if (feedProductUrl) {
          try {
            const feedResult = await scrapeWithFirecrawl(feedProductUrl, undefined, 15000);
            if (feedResult.html && feedResult.html.length > 0) {
              const feedSchemas = extractJsonLdSchemas(feedResult.html);
              if (assessSchemaQuality(feedSchemas).hasProduct) {
                productSchemas = feedSchemas;
                productPageUrl = feedProductUrl;
                productDiscoveryMethod = 'feed_discovery';
                log.info({ feedProductUrl }, 'Product schemas found via feed discovery');
              }
            }
          } catch (err) {
            log.warn({ feedProductUrl, error: err }, 'Failed to scrape feed-discovered product page');
          }
        }
      }

      if (!assessSchemaQuality(productSchemas).hasProduct) {
        log.info({ url }, 'No product schemas found from any source');
      }
    }

    const productSchemaQuality = assessSchemaQuality(productSchemas);
    const productSchema = findProductSchema(productSchemas);
    const productValidation = validateProductSchema(productSchema);

    log.info({
      homepageSchemaCount: homepageSchemas.length,
      productSchemaCount: productSchemas.length,
      productQuality: productSchemaQuality.level,
      hasProduct: productValidation.found,
      productPageUrl,
      productDiscoveryMethod,
    }, 'Schema extraction complete (explicit page separation)');

    // ==========================================
    // Step 3: Run checks with correct schema sets
    // ==========================================
    await updateJobProgress(jobId, 'analyzing', 3, 'Running checks...');

    // Infrastructure checks (parallel)
    const [botAccessResult, sitemapResult, llmsTxtResult] = await Promise.all([
      checkBotAccess(domain),
      checkSitemap(domain),
      checkLlmsTxt(domain),
    ]);

    // TTFB check
    const ttfbResult = checkServerResponseTime(ttfbMs);

    // Homepage-based checks (D5 WebSite Schema, T1 Organization Schema)
    const websiteSchemaResult = checkWebSiteSchema(homepageSchemas);
    const orgSchemaResult = checkOrganizationSchema(homepageSchemas, { source: 'homepage' });

    // Product page-based checks (D4 Product Schema, X1 UCP Compliance, T2 Trust Signals)
    const productSchemaResult = checkProductSchema(productSchemas);
    const ucpResult = checkUcpCompliance(productSchemas, productSchema);
    const trustSignalsResult = checkTrustSignals(url, productSchemas);

    // FAQ schema can appear on either homepage or product pages — check both
    const allSchemas = [...homepageSchemas, ...productSchemas];
    const faqSchemaResult = checkFaqSchema(allSchemas);

    // Submitted URL-based checks (X4 Payment Methods)
    const paymentMethodsResult = checkPaymentMethods(submittedHtml, domain);

    // Distribution signal checks (async)
    await updateJobProgress(jobId, 'analyzing', 4, 'Checking distribution signals...');

    const productFeedResult = await checkProductFeed(
      domain, submittedHtml, botAccessResult.rawRobotsTxt, paymentMethodsResult.platformDetection
    );
    const commerceApiResult = await checkCommerceApi(
      domain, submittedHtml, productValidation, productSchemaQuality
    );

    // Step 4: Calculate scores (3-layer model)
    await updateJobProgress(jobId, 'scoring', 5, 'Calculating score...');

    const checks: Check[] = [
      botAccessResult.check,        // D1 (7 pts)
      sitemapResult.check,          // D2 (5 pts)
      ttfbResult.check,             // D3 (3 pts)
      llmsTxtResult.check,          // D11 (2 pts)
      productSchemaResult.check,    // D4 (10 pts)
      websiteSchemaResult.check,    // D5 (3 pts)
      productFeedResult.check,      // D7 (4 pts)
      commerceApiResult.check,      // D9 (10 pts)
      faqSchemaResult.check,        // D6 (3 pts)
      orgSchemaResult.check,        // T1 (12 pts)
      trustSignalsResult.check,     // T2 (8 pts)
      ucpResult.check,              // X1 (20 pts)
      paymentMethodsResult.check,   // X4 (15 pts)
    ];

    // Layer scores
    const discoveryScore = botAccessResult.check.score
      + sitemapResult.check.score
      + ttfbResult.check.score
      + llmsTxtResult.check.score
      + productSchemaResult.check.score
      + websiteSchemaResult.check.score
      + productFeedResult.check.score
      + faqSchemaResult.check.score;

    const trustScore = orgSchemaResult.check.score
      + trustSignalsResult.check.score;

    const transactionScore = ucpResult.check.score
      + paymentMethodsResult.check.score
      + commerceApiResult.check.score;

    const totalScore = discoveryScore + trustScore + transactionScore;

    // Max possible = sum of all active check maxScores (102 in Phase 1)
    const maxPossibleScore = checks.reduce((sum, c) => sum + c.maxScore, 0);

    const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    const grade = getGrade(normalizedScore);

    // Generate recommendations
    const recommendations = generateRecommendations(checks, {
      D4: productValidation,
      D6: faqSchemaResult.validation,
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
          ttfbMs,
          pageSeparation: {
            urlIsHomepage,
            productPageUrl,
            productDiscoveryMethod,
            homepageSchemaCount: homepageSchemas.length,
            productSchemaCount: productSchemas.length,
            productQuality: productSchemaQuality.level,
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
