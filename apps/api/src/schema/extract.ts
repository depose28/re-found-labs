import { createLogger } from '../lib/logger';

const log = createLogger('schema:extract');

export interface ExtractedSchema {
  type: string;
  data: Record<string, any>;
  source: 'json-ld' | 'microdata' | 'rdfa';
}

// Extract all JSON-LD schemas from HTML
export function extractJsonLdSchemas(html: string): ExtractedSchema[] {
  const schemas: ExtractedSchema[] = [];

  // Match all JSON-LD script blocks
  const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdPattern.exec(html)) !== null) {
    try {
      const content = match[1].trim();
      if (!content) continue;

      const parsed = JSON.parse(content);

      // Handle @graph arrays
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        for (const item of parsed['@graph']) {
          if (item['@type']) {
            schemas.push({
              type: normalizeType(item['@type']),
              data: item,
              source: 'json-ld',
            });
          }
        }
      } else if (Array.isArray(parsed)) {
        // Handle array of schemas
        for (const item of parsed) {
          if (item['@type']) {
            schemas.push({
              type: normalizeType(item['@type']),
              data: item,
              source: 'json-ld',
            });
          }
        }
      } else if (parsed['@type']) {
        // Single schema object
        schemas.push({
          type: normalizeType(parsed['@type']),
          data: parsed,
          source: 'json-ld',
        });
      }
    } catch (e) {
      log.debug({ error: e }, 'Failed to parse JSON-LD block');
    }
  }

  return schemas;
}

// Normalize schema type (handle arrays, prefixes)
function normalizeType(type: string | string[]): string {
  if (Array.isArray(type)) {
    return type[0]?.replace('https://schema.org/', '').replace('http://schema.org/', '') || 'Unknown';
  }
  return type.replace('https://schema.org/', '').replace('http://schema.org/', '');
}

// Find schemas of a specific type
export function findSchemasByType(schemas: ExtractedSchema[], type: string): ExtractedSchema[] {
  const normalizedType = type.toLowerCase();
  return schemas.filter(s => s.type.toLowerCase() === normalizedType);
}

// Find Product schema (including nested in offers)
export function findProductSchema(schemas: ExtractedSchema[]): Record<string, any> | null {
  // Direct Product schema
  const products = findSchemasByType(schemas, 'Product');
  if (products.length > 0) {
    return products[0].data;
  }

  // Check for Product inside other schemas
  for (const schema of schemas) {
    if (schema.data.mainEntity && normalizeType(schema.data.mainEntity['@type'] || '').toLowerCase() === 'product') {
      return schema.data.mainEntity;
    }
    if (schema.data.offers?.itemOffered) {
      const itemOffered = schema.data.offers.itemOffered;
      if (normalizeType(itemOffered['@type'] || '').toLowerCase() === 'product') {
        return itemOffered;
      }
    }
  }

  return null;
}

// Find Organization schema
export function findOrganizationSchema(schemas: ExtractedSchema[]): Record<string, any> | null {
  const orgTypes = ['Organization', 'LocalBusiness', 'Store', 'OnlineStore', 'Corporation'];

  for (const type of orgTypes) {
    const found = findSchemasByType(schemas, type);
    if (found.length > 0) {
      return found[0].data;
    }
  }

  return null;
}

// Find Offer schema (standalone or from Product)
export function findOfferSchema(
  schemas: ExtractedSchema[],
  productSchema?: Record<string, any> | null
): Record<string, any> | null {
  // Check product's offers first
  if (productSchema?.offers) {
    const offers = productSchema.offers;
    if (Array.isArray(offers)) {
      return offers[0];
    }
    return offers;
  }

  // Look for standalone Offer
  const offers = findSchemasByType(schemas, 'Offer');
  if (offers.length > 0) {
    return offers[0].data;
  }

  // Check AggregateOffer
  const aggregateOffers = findSchemasByType(schemas, 'AggregateOffer');
  if (aggregateOffers.length > 0) {
    return aggregateOffers[0].data;
  }

  return null;
}

// Find MerchantReturnPolicy schema
export function findReturnPolicySchema(schemas: ExtractedSchema[]): Record<string, any> | null {
  const policies = findSchemasByType(schemas, 'MerchantReturnPolicy');
  if (policies.length > 0) {
    return policies[0].data;
  }

  // Check if linked from Product/Offer
  for (const schema of schemas) {
    if (schema.data.hasMerchantReturnPolicy) {
      return schema.data.hasMerchantReturnPolicy;
    }
    if (schema.data.offers?.hasMerchantReturnPolicy) {
      return schema.data.offers.hasMerchantReturnPolicy;
    }
  }

  return null;
}

// Assess overall schema quality
export interface SchemaQuality {
  level: 'full' | 'partial' | 'none';
  hasProduct: boolean;
  hasOffer: boolean;
  hasGtin: boolean;
  hasAggregateOffer: boolean;
  hasItemList: boolean;
  productCount?: number;
}

export function assessSchemaQuality(schemas: ExtractedSchema[]): SchemaQuality {
  const product = findProductSchema(schemas);
  const hasProduct = !!product;
  const hasOffer = !!findOfferSchema(schemas, product);
  const hasGtin = !!(product?.gtin || product?.gtin13 || product?.gtin14 ||
    product?.sku || product?.mpn || product?.isbn);

  // Check for category page schemas
  const hasAggregateOffer = findSchemasByType(schemas, 'AggregateOffer').length > 0;
  const itemLists = findSchemasByType(schemas, 'ItemList');
  const hasItemList = itemLists.length > 0;
  const productCount = hasItemList ? itemLists[0].data.numberOfItems : undefined;

  // Determine quality level
  let level: 'full' | 'partial' | 'none' = 'none';

  if (hasProduct && hasOffer && hasGtin) {
    level = 'full';
  } else if (hasProduct && hasOffer) {
    level = 'partial';
  } else if (hasProduct || hasAggregateOffer || hasItemList) {
    level = 'partial';
  }

  return {
    level,
    hasProduct,
    hasOffer,
    hasGtin,
    hasAggregateOffer,
    hasItemList,
    productCount,
  };
}

// Detect page type from URL and content
export interface PageType {
  isProduct: boolean;
  isCategory: boolean;
  isHomepage: boolean;
  confidence: 'high' | 'medium' | 'low';
  signals: string[];
}

export function detectPageType(url: string, html: string): PageType {
  const urlLower = url.toLowerCase();
  const htmlLower = html.toLowerCase();
  const signals: string[] = [];

  // URL-based signals
  const categoryUrlPatterns = ['/c/', '/category/', '/categories/', '/collection/', '/collections/',
    '/shop/', '/products/', '/catalog/', '/browse/', '/department/'];
  const productUrlPatterns = ['/p/', '/product/', '/item/', '/pd/', '/dp/', '/-p-', '-i.'];

  const hasProductUrl = productUrlPatterns.some(p => urlLower.includes(p));
  const hasCategoryUrl = categoryUrlPatterns.some(p => urlLower.includes(p));

  if (hasProductUrl) signals.push('product URL pattern');
  if (hasCategoryUrl) signals.push('category URL pattern');

  // Schema-based signals
  const schemas = extractJsonLdSchemas(html);
  const hasProductSchema = !!findProductSchema(schemas);
  const hasCollectionSchema = findSchemasByType(schemas, 'CollectionPage').length > 0 ||
    findSchemasByType(schemas, 'ItemList').length > 0;

  if (hasProductSchema) signals.push('Product schema');
  if (hasCollectionSchema) signals.push('Collection/ItemList schema');

  // Content signals
  const hasAddToCart = htmlLower.includes('add to cart') || htmlLower.includes('add-to-cart') ||
    htmlLower.includes('addtocart');
  const hasProductGrid = htmlLower.includes('product-grid') || htmlLower.includes('product-list') ||
    htmlLower.includes('product-card');

  if (hasAddToCart) signals.push('Add to cart button');
  if (hasProductGrid) signals.push('Product grid');

  // Determine page type
  let isProduct = false;
  let isCategory = false;
  let isHomepage = false;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Homepage check
  const path = new URL(url).pathname;
  if (path === '/' || path === '') {
    isHomepage = true;
    confidence = 'high';
    signals.push('Root path');
  } else if (hasProductSchema && hasAddToCart) {
    isProduct = true;
    confidence = 'high';
  } else if (hasProductUrl && hasProductSchema) {
    isProduct = true;
    confidence = 'high';
  } else if (hasCollectionSchema || (hasCategoryUrl && hasProductGrid)) {
    isCategory = true;
    confidence = 'high';
  } else if (hasProductUrl) {
    isProduct = true;
    confidence = 'medium';
  } else if (hasCategoryUrl) {
    isCategory = true;
    confidence = 'medium';
  } else if (hasAddToCart && !hasProductGrid) {
    isProduct = true;
    confidence = 'medium';
  } else if (hasProductGrid) {
    isCategory = true;
    confidence = 'medium';
  }

  return { isProduct, isCategory, isHomepage, confidence, signals };
}

// Find product links on a category page
export function findProductLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const seen = new Set<string>();

  // Common product link patterns
  const linkPatterns = [
    // Href patterns
    /href=["']([^"']*\/p\/[^"']+)["']/gi,
    /href=["']([^"']*\/product\/[^"']+)["']/gi,
    /href=["']([^"']*\/pd\/[^"']+)["']/gi,
    /href=["']([^"']*-p-\d+[^"']*)["']/gi,
    /href=["']([^"']*\/item\/[^"']+)["']/gi,
    /href=["']([^"']*\/dp\/[^"']+)["']/gi,
    // Data attributes
    /data-product-url=["']([^"']+)["']/gi,
    /data-href=["']([^"']*product[^"']*)["']/gi,
  ];

  for (const pattern of linkPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let href = match[1];

      // Make absolute URL
      try {
        const absolute = new URL(href, baseUrl).href;
        if (!seen.has(absolute)) {
          seen.add(absolute);
          links.push(absolute);
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }

  // Sort by likely product URLs (shorter paths often more canonical)
  links.sort((a, b) => a.length - b.length);

  return links.slice(0, 10); // Return top 10
}

// Find a single product link on page (more comprehensive patterns)
export function findProductLinkOnPage(html: string, baseUrl: string): string | null {
  const urlObj = new URL(baseUrl);
  const domain = urlObj.origin;
  const hostname = urlObj.hostname;

  // Product URL patterns - expanded for various e-commerce platforms
  const productPatterns = [
    // Specific patterns first
    /href=["']([^"']*\/p\/[^"'#?\s]+)/gi,
    /href=["']([^"']*\/product\/[^"'#?\s]+)/gi,
    /href=["']([^"']*\/products\/[^"'#?\s]+)/gi,
    /href=["']([^"']*\/item\/[^"'#?\s]+)/gi,
    /href=["']([^"']*\/pd\/[^"'#?\s]+)/gi,
    // ID-based patterns (eobuwie uses -i followed by numbers)
    /href=["']([^"'\s]*-i\d+[^"'\s]*)/gi,
    /href=["']([^"'\s]*-p-\d+[^"'\s]*)/gi,
    /href=["']([^"'\s]*-\d{5,}\.html[^"'\s]*)/gi,
    /href=["']([^"'\s]*\/dp\/[A-Z0-9]+[^"'\s]*)/gi,
  ];

  log.debug({ hostname, htmlLength: html.length }, 'Searching for product links');

  // First, try specific patterns
  for (const pattern of productPatterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(html);
    if (match && match[1]) {
      let productUrl = match[1];

      // Skip category/collection URLs
      if (
        productUrl.includes('/c/') ||
        productUrl.includes('/category/') ||
        productUrl.includes('/collection/') ||
        productUrl.includes('/collections/') ||
        productUrl.includes('/shop/') ||
        productUrl.includes('/catalog/') ||
        productUrl === baseUrl
      ) {
        continue;
      }

      // Make absolute URL
      if (productUrl.startsWith('/')) {
        productUrl = domain + productUrl;
      } else if (!productUrl.startsWith('http')) {
        productUrl = domain + '/' + productUrl;
      }

      try {
        const productUrlObj = new URL(productUrl);
        if (productUrlObj.hostname === hostname) {
          log.debug({ productUrl }, 'Found product link via pattern');
          return productUrl;
        }
      } catch {
        // Invalid URL, continue
      }
    }
  }

  log.debug('No product link found via patterns');
  return null;
}

// Smart schema extraction result
export interface SmartSchemaResult {
  schemas: ExtractedSchema[];
  schemaQuality: SchemaQuality;
  productValidation: {
    found: boolean;
    valid: boolean;
    schema: Record<string, any> | null;
    missingFields: string[];
    invalidFields: string[];
    warnings: string[];
  };
  sourceUrl: string;
  checkedProductPage: boolean;
  productPageUrl?: string;
  categoryPageSchemas?: ExtractedSchema[];
  message: string;
}

// Smart schema extraction - handles category pages by following product links
export async function extractSchemasSmartly(
  html: string,
  url: string,
  scrapeProductPage?: (url: string) => Promise<{ html: string } | null>
): Promise<SmartSchemaResult> {
  // Extract schemas from submitted URL
  const schemas = extractJsonLdSchemas(html);
  const pageType = detectPageType(url, html);
  const schemaQuality = assessSchemaQuality(schemas);

  log.info(
    {
      url,
      pageType: pageType.isCategory ? 'category' : pageType.isProduct ? 'product' : 'other',
      schemaQuality: schemaQuality.level,
    },
    'Smart schema extraction starting'
  );

  // If we have full Product + Offer schema, use it
  if (schemaQuality.level === 'full') {
    const productValidation = createProductValidation(schemas);
    return {
      schemas,
      schemaQuality,
      productValidation,
      sourceUrl: url,
      checkedProductPage: false,
      message: 'Product schema found on submitted page',
    };
  }

  // If it's a category page, be conservative about following to product pages
  if (pageType.isCategory) {
    // If we have partial schema (ItemList, AggregateOffer, etc.), use it without following
    // This saves 1 Firecrawl credit per category page scan
    if (schemaQuality.level === 'partial') {
      log.debug('Category page with partial schema - using existing data (conserving API credits)');
      const productValidation = createProductValidation(schemas);
      return {
        schemas,
        schemaQuality,
        productValidation,
        sourceUrl: url,
        checkedProductPage: false,
        message: 'Using partial schema from category page (conserving API credits)',
      };
    }

    // Only follow to product page if schema is COMPLETELY absent
    if (schemaQuality.level === 'none' && scrapeProductPage) {
      log.debug('Category page with NO schema, looking for product link...');

      const productLink = findProductLinkOnPage(html, url);

      if (productLink) {
        log.info({ productLink }, 'Found product link, scraping product page');

        try {
          const productPageResult = await scrapeProductPage(productLink);

          if (productPageResult?.html && productPageResult.html.length > 0) {
            const productPageSchemas = extractJsonLdSchemas(productPageResult.html);
            const productPageQuality = assessSchemaQuality(productPageSchemas);

            log.debug({ schemaQuality: productPageQuality.level }, 'Product page schema quality');

            // Use product page schemas if they have ANY useful data
            if (productPageQuality.level !== 'none') {
              const productValidation = createProductValidation(productPageSchemas);
              return {
                schemas: productPageSchemas,
                schemaQuality: productPageQuality,
                productValidation,
                sourceUrl: productLink,
                checkedProductPage: true,
                productPageUrl: productLink,
                categoryPageSchemas: schemas,
                message:
                  productPageQuality.level === 'full'
                    ? 'Product schema found on product pages'
                    : 'Partial Product schema found on product pages',
              };
            }
          }
        } catch (error) {
          log.warn({ error, productLink }, 'Failed to scrape product page');
        }
      }
    }

    // Couldn't find better schema on product page (only reached if schemaQuality.level === 'none')
    const productValidation = createProductValidation(schemas);
    return {
      schemas,
      schemaQuality,
      productValidation,
      sourceUrl: url,
      checkedProductPage: true, // We attempted but didn't find useful data
      message: 'No structured data found on category or product pages',
    };
  }

  // Not a category page, use what we have
  const productValidation = createProductValidation(schemas);
  return {
    schemas,
    schemaQuality,
    productValidation,
    sourceUrl: url,
    checkedProductPage: false,
    message:
      schemaQuality.level === 'none'
        ? 'No structured product data found'
        : 'Partial schema found on page',
  };
}

// Helper to create product validation from schemas
function createProductValidation(schemas: ExtractedSchema[]) {
  const productSchema = findProductSchema(schemas);
  return {
    found: !!productSchema,
    valid: false, // Will be set by full validation
    schema: productSchema,
    missingFields: [] as string[],
    invalidFields: [] as string[],
    warnings: [] as string[],
  };
}
