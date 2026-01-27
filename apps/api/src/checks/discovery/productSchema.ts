import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findProductSchema, assessSchemaQuality } from '../../schema/extract';
import { validateProductSchema, ValidationResult } from '../../schema/validate';

const log = createLogger('check:productSchema');

export interface ProductSchemaResult {
  check: Check;
  validation: ValidationResult;
  schemaQuality: ReturnType<typeof assessSchemaQuality>;
}

export function checkProductSchema(schemas: ExtractedSchema[]): ProductSchemaResult {
  const { id, name, category, maxScore } = CHECKS.D2;

  log.debug({ schemaCount: schemas.length }, 'Checking product schema');

  const productSchema = findProductSchema(schemas);
  const validation = validateProductSchema(productSchema);
  const schemaQuality = assessSchemaQuality(schemas);

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (!validation.found) {
    status = 'fail';
    score = 0;
    details = 'No Product schema found — AI agents cannot read your product data';
  } else if (validation.valid && validation.warnings.length === 0) {
    status = 'pass';
    score = maxScore;
    details = 'Complete, valid Product schema with all recommended fields';
  } else if (validation.valid) {
    status = 'pass';
    score = Math.round(maxScore * 0.85);
    details = `Valid Product schema. Minor improvements: ${validation.warnings.slice(0, 2).join(', ')}`;
  } else if (validation.missingFields.length <= 2) {
    status = 'partial';
    score = Math.round(maxScore * 0.55);
    details = `Product schema found but missing: ${validation.missingFields.join(', ')}`;
  } else {
    status = 'partial';
    score = Math.round(maxScore * 0.3);
    details = `Incomplete Product schema. Missing ${validation.missingFields.length} required fields`;
  }

  log.info({
    found: validation.found,
    valid: validation.valid,
    missingFields: validation.missingFields,
    score,
  }, 'Product schema check complete');

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
        valid: validation.valid,
        missingFields: validation.missingFields,
        invalidFields: validation.invalidFields,
        warnings: validation.warnings,
        schemaQuality: schemaQuality.level,
      },
    },
    validation,
    schemaQuality,
  };
}
