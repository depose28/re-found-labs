import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findWebSiteSchema } from '../../schema/extract';
import { validateWebSiteSchema, ValidationResult } from '../../schema/validate';

const log = createLogger('check:websiteSchema');

export interface WebSiteSchemaResult {
  check: Check;
  validation: ValidationResult & { hasSearchAction: boolean };
}

export function checkWebSiteSchema(schemas: ExtractedSchema[]): WebSiteSchemaResult {
  const { id, name, category, maxScore } = CHECKS.D5;

  log.debug({ schemaCount: schemas.length }, 'Checking WebSite schema');

  const websiteSchema = findWebSiteSchema(schemas);
  const validation = validateWebSiteSchema(websiteSchema);

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (!validation.found) {
    status = 'fail';
    score = 0;
    details = 'No WebSite schema — search engines may not understand your site structure';
  } else if (validation.valid && validation.hasSearchAction) {
    status = 'pass';
    score = maxScore;
    details = `WebSite schema with SearchAction enables Google sitelinks search box`;
  } else if (validation.valid) {
    status = 'partial';
    score = Math.round(maxScore * 0.6);
    details = `WebSite schema found but missing SearchAction for site search`;
  } else {
    status = 'partial';
    score = Math.round(maxScore * 0.4);
    details = `Incomplete WebSite schema. Missing: ${validation.missingFields.join(', ')}`;
  }

  log.info({
    found: validation.found,
    hasSearchAction: validation.hasSearchAction,
    score,
  }, 'WebSite schema check complete');

  return {
    check: {
      id,
      name,
      category: category as any,
      status,
      score,
      maxScore,
      details,
      data: {
        found: validation.found,
        name: websiteSchema?.name,
        url: websiteSchema?.url,
        hasSearchAction: validation.hasSearchAction,
        warnings: validation.warnings,
      },
    },
    validation,
  };
}
