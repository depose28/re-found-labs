import { Check, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';

const log = createLogger('check:llms-txt');

export interface LlmsTxtResult {
  check: Check;
  llmsTxtUrl: string | null;
  variant: string | null;
}

export async function checkLlmsTxt(domain: string): Promise<LlmsTxtResult> {
  const { id, name, category, maxScore } = CHECKS.D11;

  log.info({ domain }, 'Checking for llms.txt');

  const variants = [
    { url: `${domain}/llms.txt`, name: 'llms.txt' },
    { url: `${domain}/LLMs.txt`, name: 'LLMs.txt' },
    { url: `${domain}/llms-full.txt`, name: 'llms-full.txt' },
  ];

  for (const variant of variants) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(variant.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AgentPulseBot/1.0' },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const content = await response.text();

        // Reject HTML responses (404 pages served as 200)
        const trimmed = content.trim().toLowerCase();
        if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          log.debug({ url: variant.url }, 'Response is HTML, not llms.txt');
          continue;
        }

        // Reject empty or near-empty content
        if (content.trim().length <= 10) {
          log.debug({ url: variant.url }, 'Content too short');
          continue;
        }

        log.info({ url: variant.url, length: content.length }, 'Valid llms.txt found');

        return {
          check: {
            id,
            name,
            category: category as any,
            status: 'pass',
            score: maxScore,
            maxScore,
            details: `Found ${variant.name} (${content.trim().length} chars)`,
            data: { llmsTxtUrl: variant.url, variant: variant.name, contentLength: content.trim().length },
          },
          llmsTxtUrl: variant.url,
          variant: variant.name,
        };
      }
    } catch (error) {
      log.debug({ url: variant.url, error }, 'llms.txt check failed');
    }
  }

  log.info({ domain }, 'No llms.txt found');

  return {
    check: {
      id,
      name,
      category: category as any,
      status: 'fail',
      score: 0,
      maxScore,
      details: 'No llms.txt found — consider adding one to signal AI-readiness',
      data: { checked: variants.map(v => v.url) },
    },
    llmsTxtUrl: null,
    variant: null,
  };
}
