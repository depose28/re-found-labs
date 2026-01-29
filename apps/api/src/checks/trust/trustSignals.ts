import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findReturnPolicySchema } from '../../schema/extract';
import { validateReturnPolicySchema, ValidationResult } from '../../schema/validate';

const log = createLogger('check:trustSignals');

export interface TrustSignalsResult {
  check: Check;
  validation: ValidationResult;
  isHttps: boolean;
}

// Combined check: HTTPS (3 pts) + Return Policy Schema (4 pts) = 7 pts total
export function checkTrustSignals(
  url: string,
  schemas: ExtractedSchema[]
): TrustSignalsResult {
  const { id, name, category, maxScore } = CHECKS.T2;

  // Sub-check 1: HTTPS (3 pts)
  const isHttps = url.startsWith('https://');
  const httpsScore = isHttps ? 3 : 0;

  // Sub-check 2: Return Policy (4 pts)
  const policySchema = findReturnPolicySchema(schemas);
  const validation = validateReturnPolicySchema(policySchema);

  let returnPolicyScore = 0;
  let returnPolicyDetail = '';

  if (!validation.found) {
    returnPolicyScore = 0;
    returnPolicyDetail = 'no return policy schema';
  } else if (validation.warnings.length === 0) {
    returnPolicyScore = 4;
    const days = policySchema?.merchantReturnDays;
    returnPolicyDetail = days ? `complete return policy (${days} days)` : 'complete return policy';
  } else if (validation.warnings.length <= 2) {
    returnPolicyScore = 2;
    returnPolicyDetail = `return policy incomplete: ${validation.warnings[0]}`;
  } else {
    returnPolicyScore = 1;
    returnPolicyDetail = 'return policy has multiple missing fields';
  }

  const totalScore = httpsScore + returnPolicyScore;

  let status: CheckStatus;
  let details: string;

  if (totalScore === maxScore) {
    status = 'pass';
    details = `HTTPS enabled + ${returnPolicyDetail}`;
  } else if (totalScore > 0) {
    status = 'partial';
    const parts: string[] = [];
    if (isHttps) parts.push('HTTPS enabled');
    else parts.push('no HTTPS');
    parts.push(returnPolicyDetail);
    details = parts.join(', ');
  } else {
    status = 'fail';
    details = "No HTTPS and no return policy — agents won't trust this site";
  }

  log.info({
    isHttps,
    httpsScore,
    returnPolicyFound: validation.found,
    returnPolicyScore,
    totalScore,
  }, 'Trust signals check complete');

  return {
    check: {
      id,
      name,
      category: category as any,
      status,
      score: totalScore,
      maxScore,
      details,
      data: {
        isHttps,
        httpsScore,
        returnPolicyFound: validation.found,
        returnPolicyScore,
        returnDays: policySchema?.merchantReturnDays,
        returnMethod: policySchema?.returnMethod,
        applicableCountry: policySchema?.applicableCountry,
        warnings: validation.warnings,
      },
    },
    validation,
    isHttps,
  };
}
