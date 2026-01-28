import { task, logger } from "@trigger.dev/sdk/v3";
import { runAnalysis, AnalyzeJobPayload } from "../jobs/analyze.job";

/**
 * Trigger.dev task for running e-commerce analysis.
 *
 * This task handles the heavy lifting of:
 * - Scraping pages (basic fetch + Firecrawl fallback)
 * - Extracting and validating schemas
 * - Running all 15 checks across 5 pillars
 * - Calculating scores and generating recommendations
 *
 * Typical duration: 30-60 seconds
 * Max duration: 5 minutes (to handle slow sites)
 */
export const analyzeTask = task({
  id: "analyze-ecommerce-site",
  // Allow up to 5 minutes for slow sites
  maxDuration: 300,
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: AnalyzeJobPayload) => {
    const { jobId, url } = payload;

    logger.info("Starting analysis", { jobId, url });

    const startTime = Date.now();

    try {
      const result = await runAnalysis(payload);

      const duration = Date.now() - startTime;
      logger.info("Analysis completed", {
        jobId,
        success: result.success,
        analysisId: result.analysisId,
        durationMs: duration
      });

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error("Analysis failed", {
        jobId,
        error: error.message,
        durationMs: duration
      });

      throw error;
    }
  },
});
