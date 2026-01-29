import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findOrganizationSchema } from '../../schema/extract';
import { validateOrganizationSchema, ValidationResult } from '../../schema/validate';

const log = createLogger('check:organization');

export interface OrganizationResult {
  check: Check;
  validation: ValidationResult;
}

export interface OrganizationCheckOptions {
  /** Where the Organization schema was found */
  source?: 'product_page' | 'homepage';
}

export function checkOrganizationSchema(
  schemas: ExtractedSchema[],
  options: OrganizationCheckOptions = {}
): OrganizationResult {
  const { id, name, category, maxScore } = CHECKS.T1;
  const { source } = options;

  log.debug({ schemaCount: schemas.length, source }, 'Checking organization schema');

  const orgSchema = findOrganizationSchema(schemas);
  const validation = validateOrganizationSchema(orgSchema);

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (!validation.found) {
    status = 'fail';
    score = 0;
    details = "No Organization schema — agents can't verify your business identity";
  } else if (validation.valid && validation.warnings.length <= 1) {
    status = 'pass';
    score = maxScore;
    details = `Complete Organization schema for "${orgSchema?.name}"`;
  } else if (validation.valid) {
    status = 'pass';
    score = Math.round(maxScore * 0.8);
    details = `Organization schema found. Missing: ${validation.warnings.slice(0, 2).join(', ')}`;
  } else {
    status = 'partial';
    score = Math.round(maxScore * 0.5);
    details = `Incomplete Organization schema. Missing: ${validation.missingFields.join(', ')}`;
  }

  // Add source info to details if found on homepage
  if (validation.found && source === 'homepage') {
    details += ' (found on homepage)';
  }

  log.info({
    found: validation.found,
    orgName: orgSchema?.name,
    source,
    score,
  }, 'Organization schema check complete');

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
        name: orgSchema?.name,
        type: orgSchema?.['@type'],
        hasContact: !!(orgSchema?.contactPoint || orgSchema?.telephone || orgSchema?.email),
        warnings: validation.warnings,
        source: source || 'product_page',
      },
    },
    validation,
  };
}
