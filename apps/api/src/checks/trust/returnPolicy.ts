import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findReturnPolicySchema } from '../../schema/extract';
import { validateReturnPolicySchema, ValidationResult } from '../../schema/validate';

const log = createLogger('check:returnPolicy');

export interface ReturnPolicyResult {
  check: Check;
  validation: ValidationResult;
}

export function checkReturnPolicySchema(schemas: ExtractedSchema[]): ReturnPolicyResult {
  const { id, name, category, maxScore } = CHECKS.R2;

  log.debug({ schemaCount: schemas.length }, 'Checking return policy schema');

  const policySchema = findReturnPolicySchema(schemas);
  const validation = validateReturnPolicySchema(policySchema);

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (!validation.found) {
    status = 'fail';
    score = 0;
    details = "No MerchantReturnPolicy schema — agents can't verify return terms";
  } else if (validation.warnings.length === 0) {
    status = 'pass';
    score = maxScore;
    const days = policySchema?.merchantReturnDays;
    details = days ? `Complete return policy (${days} days)` : 'Complete return policy schema';
  } else if (validation.warnings.length <= 2) {
    status = 'partial';
    score = Math.round(maxScore * 0.6);
    details = `Return policy found but incomplete: ${validation.warnings[0]}`;
  } else {
    status = 'partial';
    score = Math.round(maxScore * 0.4);
    details = 'Return policy schema has multiple missing fields';
  }

  log.info({
    found: validation.found,
    returnDays: policySchema?.merchantReturnDays,
    score,
  }, 'Return policy schema check complete');

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
        returnDays: policySchema?.merchantReturnDays,
        returnMethod: policySchema?.returnMethod,
        warnings: validation.warnings,
      },
    },
    validation,
  };
}
