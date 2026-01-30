import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findFAQPageSchema } from '../../schema/extract';
import { validateFAQPageSchema } from '../../schema/validate';

const log = createLogger('check:faqSchema');

export interface FaqSchemaResult {
  check: Check;
  validation: ReturnType<typeof validateFAQPageSchema>;
}

export function checkFaqSchema(schemas: ExtractedSchema[]): FaqSchemaResult {
  const { id, name, category, maxScore } = CHECKS.D6;

  log.debug({ schemaCount: schemas.length }, 'Checking FAQ schema');

  const faqSchema = findFAQPageSchema(schemas);
  const validation = validateFAQPageSchema(faqSchema);

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (!validation.found) {
    status = 'fail';
    score = 0;
    details = 'No FAQ structured data found — AI agents cannot match user questions to your answers';
  } else if (validation.questionCount >= 5 && validation.valid) {
    status = 'pass';
    score = maxScore;
    details = `${validation.questionCount} FAQ questions with structured data — AI agents can cite your answers directly`;
  } else if (validation.questionCount >= 3) {
    status = 'partial';
    score = Math.round(maxScore * 0.6);
    details = `${validation.questionCount} FAQ questions found — add more to improve AI citation coverage`;
  } else {
    status = 'partial';
    score = Math.round(maxScore * 0.4);
    details = `Only ${validation.questionCount} FAQ question${validation.questionCount === 1 ? '' : 's'} found — aim for 5+ for full coverage`;
  }

  log.info({
    found: validation.found,
    questionCount: validation.questionCount,
    score,
  }, 'FAQ schema check complete');

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
        questionCount: validation.questionCount,
        missingFields: validation.missingFields,
        invalidFields: validation.invalidFields,
        warnings: validation.warnings,
      },
    },
    validation,
  };
}
