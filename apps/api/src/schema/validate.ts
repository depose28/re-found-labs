import { ISO_4217_CURRENCIES, SCHEMA_AVAILABILITY_VALUES } from '@agent-pulse/shared';
import { createLogger } from '../lib/logger';

const log = createLogger('schema:validate');

/**
 * Validate GTIN format (check digit using modulo-10 algorithm).
 * Supports GTIN-8, GTIN-12 (UPC), GTIN-13 (EAN), and GTIN-14.
 */
export function validateGtinFormat(gtin: string): { valid: boolean; type: string | null; error?: string } {
  if (!gtin || typeof gtin !== 'string') {
    return { valid: false, type: null, error: 'GTIN is empty or not a string' };
  }

  // Remove any spaces or dashes
  const cleanGtin = gtin.replace(/[\s-]/g, '');

  // Check if all digits
  if (!/^\d+$/.test(cleanGtin)) {
    return { valid: false, type: null, error: 'GTIN contains non-numeric characters' };
  }

  // Determine GTIN type by length
  const length = cleanGtin.length;
  let type: string | null = null;

  switch (length) {
    case 8:
      type = 'GTIN-8';
      break;
    case 12:
      type = 'UPC-A (GTIN-12)';
      break;
    case 13:
      type = 'EAN-13 (GTIN-13)';
      break;
    case 14:
      type = 'GTIN-14';
      break;
    default:
      return { valid: false, type: null, error: `Invalid GTIN length: ${length} (expected 8, 12, 13, or 14)` };
  }

  // Validate check digit using modulo-10 algorithm
  const digits = cleanGtin.split('').map(Number);
  const checkDigit = digits[digits.length - 1];
  let sum = 0;

  for (let i = 0; i < digits.length - 1; i++) {
    // For GTIN-13/GTIN-8, odd positions (from right, excluding check) multiply by 3
    // For GTIN-14/UPC, even positions multiply by 3
    const positionFromRight = digits.length - 1 - i;
    const multiplier = positionFromRight % 2 === 0 ? 3 : 1;
    sum += digits[i] * multiplier;
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;

  if (checkDigit !== calculatedCheckDigit) {
    return {
      valid: false,
      type,
      error: `Invalid check digit: expected ${calculatedCheckDigit}, got ${checkDigit}`,
    };
  }

  return { valid: true, type };
}

export interface ValidationResult {
  found: boolean;
  valid: boolean;
  schema: Record<string, any> | null;
  missingFields: string[];
  invalidFields: string[];
  warnings: string[];
  identifierType?: string; // Type of product identifier found (e.g., "EAN-13", "SKU")
}

// Validate Product schema
export function validateProductSchema(schema: Record<string, any> | null): ValidationResult {
  const result: ValidationResult = {
    found: !!schema,
    valid: false,
    schema,
    missingFields: [],
    invalidFields: [],
    warnings: [],
  };

  if (!schema) {
    return result;
  }

  // Required fields
  const requiredFields = ['name', 'description', 'image'];
  for (const field of requiredFields) {
    if (!schema[field]) {
      result.missingFields.push(field);
    }
  }

  // Recommended fields
  const recommendedFields = ['brand', 'sku', 'gtin', 'offers'];
  for (const field of recommendedFields) {
    if (!schema[field]) {
      result.warnings.push(`Missing recommended field: ${field}`);
    }
  }

  // Validate name
  if (schema.name && typeof schema.name === 'string') {
    if (schema.name.length < 3) {
      result.invalidFields.push('name (too short)');
    } else if (schema.name.length > 300) {
      result.warnings.push('name is very long (>300 chars)');
    }
  }

  // Validate description
  if (schema.description && typeof schema.description === 'string') {
    if (schema.description.length < 10) {
      result.warnings.push('description is very short');
    }
  }

  // Validate image
  if (schema.image) {
    const images = Array.isArray(schema.image) ? schema.image : [schema.image];
    const validImages = images.filter((img: any) => {
      const url = typeof img === 'string' ? img : img?.url;
      return url && (url.startsWith('http://') || url.startsWith('https://'));
    });
    if (validImages.length === 0) {
      result.invalidFields.push('image (invalid URL)');
    }
  }

  // Validate brand
  if (schema.brand) {
    const brandName = typeof schema.brand === 'string' ? schema.brand : schema.brand?.name;
    if (!brandName) {
      result.warnings.push('brand missing name');
    }
  }

  // Check for product identifiers and validate GTIN format
  const gtinValue = schema.gtin || schema.gtin13 || schema.gtin14 || schema.gtin8;
  const hasOtherIdentifier = schema.sku || schema.mpn || schema.isbn;

  if (gtinValue) {
    const gtinValidation = validateGtinFormat(gtinValue);
    if (gtinValidation.valid) {
      result.identifierType = gtinValidation.type || 'GTIN';
    } else {
      result.invalidFields.push(`gtin (${gtinValidation.error})`);
    }
  } else if (hasOtherIdentifier) {
    // Track which identifier type is present
    if (schema.sku) result.identifierType = 'SKU';
    else if (schema.mpn) result.identifierType = 'MPN';
    else if (schema.isbn) result.identifierType = 'ISBN';
  } else {
    result.warnings.push('No product identifier (GTIN/SKU/MPN)');
  }

  // Determine validity
  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;

  return result;
}

// Validate Offer schema
export function validateOfferSchema(schema: Record<string, any> | null): ValidationResult {
  const result: ValidationResult = {
    found: !!schema,
    valid: false,
    schema,
    missingFields: [],
    invalidFields: [],
    warnings: [],
  };

  if (!schema) {
    return result;
  }

  // Required fields for Offer
  if (!schema.price && !schema.lowPrice && !schema.highPrice) {
    result.missingFields.push('price');
  }

  // Validate price format
  if (schema.price !== undefined) {
    const price = parseFloat(schema.price);
    if (isNaN(price) || price < 0) {
      result.invalidFields.push('price (invalid number)');
    }
  }

  // Validate currency
  if (!schema.priceCurrency) {
    result.missingFields.push('priceCurrency');
  } else if (!ISO_4217_CURRENCIES.includes(schema.priceCurrency as any)) {
    result.invalidFields.push(`priceCurrency (${schema.priceCurrency} not valid ISO 4217)`);
  }

  // Validate availability
  if (!schema.availability) {
    result.warnings.push('Missing availability');
  } else {
    const availability = schema.availability.replace('https://schema.org/', '').replace('http://schema.org/', '');
    const validAvailability = SCHEMA_AVAILABILITY_VALUES.some((v: string) =>
      v.toLowerCase() === availability.toLowerCase() ||
      v.endsWith(availability)
    );
    if (!validAvailability) {
      result.warnings.push(`Unknown availability value: ${availability}`);
    }
  }

  // Check for seller
  if (!schema.seller) {
    result.warnings.push('Missing seller information');
  }

  // Determine validity
  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;

  return result;
}

// Validate Organization schema
export function validateOrganizationSchema(schema: Record<string, any> | null): ValidationResult {
  const result: ValidationResult = {
    found: !!schema,
    valid: false,
    schema,
    missingFields: [],
    invalidFields: [],
    warnings: [],
  };

  if (!schema) {
    return result;
  }

  // Required fields
  if (!schema.name) {
    result.missingFields.push('name');
  }

  // Recommended fields
  if (!schema.url) {
    result.warnings.push('Missing url');
  }

  if (!schema.logo) {
    result.warnings.push('Missing logo');
  }

  // Contact information
  const hasContact = schema.contactPoint || schema.telephone || schema.email;
  if (!hasContact) {
    result.warnings.push('No contact information');
  }

  // Address
  if (!schema.address) {
    result.warnings.push('Missing address');
  }

  // Social profiles
  if (!schema.sameAs) {
    result.warnings.push('No social profiles (sameAs)');
  }

  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;

  return result;
}

// Validate WebSite schema
export function validateWebSiteSchema(schema: Record<string, any> | null): ValidationResult & { hasSearchAction: boolean } {
  const result: ValidationResult & { hasSearchAction: boolean } = {
    found: !!schema,
    valid: false,
    schema,
    missingFields: [],
    invalidFields: [],
    warnings: [],
    hasSearchAction: false,
  };

  if (!schema) {
    return result;
  }

  // Required fields
  if (!schema.name) {
    result.missingFields.push('name');
  }

  if (!schema.url) {
    result.warnings.push('Missing url');
  }

  // Check for SearchAction (potentialAction)
  const potentialAction = schema.potentialAction;
  if (potentialAction) {
    const actions = Array.isArray(potentialAction) ? potentialAction : [potentialAction];
    const searchAction = actions.find(
      (a: any) => a['@type'] === 'SearchAction' || a.type === 'SearchAction'
    );

    if (searchAction) {
      result.hasSearchAction = true;

      // Validate SearchAction has required fields
      if (!searchAction.target && !searchAction['target']) {
        result.warnings.push('SearchAction missing target URL template');
      }
      if (!searchAction['query-input'] && !searchAction.queryInput) {
        result.warnings.push('SearchAction missing query-input');
      }
    }
  }

  if (!result.hasSearchAction) {
    result.warnings.push('No SearchAction defined (enables site search in Google)');
  }

  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;

  return result;
}

// Validate FAQPage schema
export function validateFAQPageSchema(schema: Record<string, any> | null): ValidationResult & { questionCount: number } {
  const result: ValidationResult & { questionCount: number } = {
    found: !!schema,
    valid: false,
    schema,
    missingFields: [],
    invalidFields: [],
    warnings: [],
    questionCount: 0,
  };

  if (!schema) {
    return result;
  }

  // Check for mainEntity array
  const mainEntity = schema.mainEntity;
  if (!mainEntity || !Array.isArray(mainEntity) || mainEntity.length === 0) {
    result.missingFields.push('mainEntity');
    return result;
  }

  // Validate each Question
  let validCount = 0;

  for (let i = 0; i < mainEntity.length; i++) {
    const item = mainEntity[i];
    const itemType = item['@type'];

    // Must be a Question type
    if (!itemType || (itemType !== 'Question' && itemType !== 'https://schema.org/Question')) {
      result.invalidFields.push(`mainEntity[${i}] (not a Question)`);
      continue;
    }

    const questionText = item.name;
    const answer = item.acceptedAnswer;
    const answerText = typeof answer === 'string' ? answer : answer?.text;

    if (!questionText) {
      result.invalidFields.push(`mainEntity[${i}].name (missing question text)`);
      continue;
    }

    if (!answerText) {
      result.invalidFields.push(`mainEntity[${i}].acceptedAnswer (missing answer)`);
      continue;
    }

    // Answer must be substantive (at least 10 chars)
    if (typeof answerText === 'string' && answerText.length < 10) {
      result.warnings.push(`Q${i + 1} answer is very short (${answerText.length} chars)`);
      continue;
    }

    // Warn about thin answers
    if (typeof answerText === 'string' && answerText.length < 50) {
      result.warnings.push(`Q${i + 1} answer could be more detailed (${answerText.length} chars)`);
    }

    validCount++;
  }

  result.questionCount = validCount;
  result.valid = validCount >= 2 && result.missingFields.length === 0;

  return result;
}

// Validate OfferShippingDetails schema (UCP 2026 requirement)
export function validateShippingSchema(schema: Record<string, any> | null): ValidationResult {
  const result: ValidationResult = {
    found: !!schema,
    valid: false,
    schema,
    missingFields: [],
    invalidFields: [],
    warnings: [],
  };

  if (!schema) return result;

  if (!schema.shippingDestination) {
    result.missingFields.push('shippingDestination');
  }

  if (!schema.deliveryTime) {
    result.missingFields.push('deliveryTime');
  } else {
    const dt = schema.deliveryTime;
    if (!dt.transitTime && !dt.handlingTime) {
      result.warnings.push('deliveryTime missing transitTime/handlingTime detail');
    }
  }

  if (!schema.shippingRate) {
    result.warnings.push('Missing shippingRate');
  }

  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;
  return result;
}

// Validate MerchantReturnPolicy schema
export function validateReturnPolicySchema(schema: Record<string, any> | null): ValidationResult {
  const result: ValidationResult = {
    found: !!schema,
    valid: false,
    schema,
    missingFields: [],
    invalidFields: [],
    warnings: [],
  };

  if (!schema) {
    return result;
  }

  // Check for return window
  if (!schema.merchantReturnDays && !schema.returnPolicyCategory) {
    result.warnings.push('Missing return window information');
  }

  // Check return method
  if (!schema.returnMethod) {
    result.warnings.push('Missing return method');
  }

  // Check return fees
  if (!schema.returnFees) {
    result.warnings.push('Missing return fees information');
  }

  // Check applicable country
  if (!schema.applicableCountry) {
    result.warnings.push('Missing applicable country');
  }

  result.valid = result.missingFields.length === 0;

  return result;
}
