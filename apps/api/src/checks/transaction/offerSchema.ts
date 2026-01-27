import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findOfferSchema, findProductSchema } from '../../schema/extract';
import { validateOfferSchema, ValidationResult } from '../../schema/validate';

const log = createLogger('check:offerSchema');

export interface OfferSchemaResult {
  check: Check;
  validation: ValidationResult;
}

export function checkOfferSchema(
  schemas: ExtractedSchema[],
  productSchema?: Record<string, any> | null
): OfferSchemaResult {
  const { id, name, category, maxScore } = CHECKS.T1;

  log.debug({ schemaCount: schemas.length }, 'Checking offer schema');

  // Find product schema if not provided
  const product = productSchema ?? findProductSchema(schemas);
  const offerSchema = findOfferSchema(schemas, product);
  const validation = validateOfferSchema(offerSchema);

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (!validation.found) {
    status = 'fail';
    score = 0;
    details = 'No Offer schema found — agents cannot see pricing or availability';
  } else if (validation.valid) {
    status = 'pass';
    score = maxScore;
    const price = offerSchema?.price || offerSchema?.lowPrice;
    const currency = offerSchema?.priceCurrency;
    details = `Valid Offer schema with pricing (${currency} ${price})`;
  } else if (validation.missingFields.length === 1 && validation.invalidFields.length === 0) {
    status = 'partial';
    score = Math.round(maxScore * 0.65);
    details = `Offer schema present but missing: ${validation.missingFields[0]}`;
  } else {
    status = 'partial';
    score = Math.round(maxScore * 0.35);
    const issues = [...validation.missingFields, ...validation.invalidFields];
    details = `Incomplete Offer schema. Issues: ${issues.join(', ')}`;
  }

  log.info({
    found: validation.found,
    valid: validation.valid,
    score,
  }, 'Offer schema check complete');

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
        price: offerSchema?.price || offerSchema?.lowPrice,
        currency: offerSchema?.priceCurrency,
        availability: offerSchema?.availability,
        issues: [...validation.missingFields, ...validation.invalidFields],
      },
    },
    validation,
  };
}
