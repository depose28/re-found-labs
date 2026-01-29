import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { ExtractedSchema, findOfferSchema, findProductSchema, findReturnPolicySchema, findShippingSchema } from '../../schema/extract';
import { validateOfferSchema, validateShippingSchema, ValidationResult } from '../../schema/validate';

const log = createLogger('check:ucpCompliance');

export interface UcpComplianceResult {
  check: Check;
  validation: ValidationResult;
  shippingValidation: ValidationResult;
  hasApplicableCountry: boolean;
}

// UCP Compliance: Offer Schema (6 pts) + Shipping Schema (2 pts) + applicableCountry (2 pts) = 10 pts
export function checkUcpCompliance(
  schemas: ExtractedSchema[],
  productSchema?: Record<string, any> | null
): UcpComplianceResult {
  const { id, name, category, maxScore } = CHECKS.X1;

  log.debug({ schemaCount: schemas.length }, 'Checking UCP compliance');

  // Sub-check 1: Offer schema (6 pts)
  const product = productSchema ?? findProductSchema(schemas);
  const offerSchema = findOfferSchema(schemas, product);
  const validation = validateOfferSchema(offerSchema);

  let offerScore = 0;
  if (!validation.found) {
    offerScore = 0;
  } else if (validation.valid) {
    offerScore = 6;
  } else if (validation.missingFields.length === 1 && validation.invalidFields.length === 0) {
    offerScore = 4;
  } else {
    offerScore = 2;
  }

  // Sub-check 2: Shipping schema (2 pts)
  const shippingSchema = findShippingSchema(schemas);
  const shippingValidation = validateShippingSchema(shippingSchema);

  let shippingScore = 0;
  if (shippingValidation.found && shippingValidation.valid) {
    shippingScore = 2;
  } else if (shippingValidation.found) {
    shippingScore = 1;
  }

  // Sub-check 3: applicableCountry on MerchantReturnPolicy (2 pts)
  const returnPolicy = findReturnPolicySchema(schemas);
  const hasApplicableCountry = !!(returnPolicy?.applicableCountry);
  const countryScore = hasApplicableCountry ? 2 : 0;

  const totalScore = offerScore + shippingScore + countryScore;

  let status: CheckStatus;
  let details: string;

  if (totalScore >= maxScore * 0.8) {
    status = 'pass';
    const parts: string[] = [];
    if (offerScore === 6) {
      const price = offerSchema?.price || offerSchema?.lowPrice;
      const currency = offerSchema?.priceCurrency;
      parts.push(`valid offer (${currency} ${price})`);
    }
    if (shippingScore > 0) parts.push('shipping details');
    if (hasApplicableCountry) parts.push(`country: ${returnPolicy?.applicableCountry}`);
    details = `UCP compliant: ${parts.join(', ')}`;
  } else if (totalScore > 0) {
    status = 'partial';
    const missing: string[] = [];
    if (offerScore === 0) missing.push('offer schema');
    else if (offerScore < 6) missing.push('incomplete offer');
    if (shippingScore === 0) missing.push('shipping details');
    if (!hasApplicableCountry) missing.push('applicableCountry');
    details = `Partial UCP compliance. Missing: ${missing.join(', ')}`;
  } else {
    status = 'fail';
    details = 'No offer or shipping schema — not UCP compliant';
  }

  log.info({
    offerScore,
    shippingScore,
    countryScore,
    totalScore,
  }, 'UCP compliance check complete');

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
        offerFound: validation.found,
        offerValid: validation.valid,
        offerScore,
        price: offerSchema?.price || offerSchema?.lowPrice,
        currency: offerSchema?.priceCurrency,
        availability: offerSchema?.availability,
        shippingFound: shippingValidation.found,
        shippingValid: shippingValidation.valid,
        shippingScore,
        hasApplicableCountry,
        applicableCountry: returnPolicy?.applicableCountry,
        countryScore,
        issues: [...validation.missingFields, ...validation.invalidFields],
      },
    },
    validation,
    shippingValidation,
    hasApplicableCountry,
  };
}
