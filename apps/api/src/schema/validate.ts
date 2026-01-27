import { ISO_4217_CURRENCIES, SCHEMA_AVAILABILITY_VALUES } from '@agent-pulse/shared';
import { createLogger } from '../lib/logger';

const log = createLogger('schema:validate');

export interface ValidationResult {
  found: boolean;
  valid: boolean;
  schema: Record<string, any> | null;
  missingFields: string[];
  invalidFields: string[];
  warnings: string[];
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

  // Check for product identifiers
  const hasIdentifier = schema.gtin || schema.gtin13 || schema.gtin14 ||
    schema.gtin8 || schema.sku || schema.mpn || schema.isbn;
  if (!hasIdentifier) {
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
