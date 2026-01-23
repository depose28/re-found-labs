import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// CONFIGURATION
// ============================================

const CRITICAL_AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot", 
  "ChatGPT-User",
  "ClaudeBot",
  "Anthropic-AI",
  "PerplexityBot",
  "Google-Extended",
  "Amazonbot",
  "Applebot-Extended",
  "Bytespider"
];

const ISO_4217_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD", "CHF", "HKD", "SGD",
  "SEK", "KRW", "NOK", "NZD", "INR", "MXN", "TWD", "ZAR", "BRL", "DKK"
];

const SCHEMA_AVAILABILITY_VALUES = [
  "https://schema.org/InStock",
  "https://schema.org/OutOfStock", 
  "https://schema.org/PreOrder",
  "https://schema.org/BackOrder",
  "https://schema.org/Discontinued",
  "https://schema.org/InStoreOnly",
  "https://schema.org/OnlineOnly",
  "https://schema.org/LimitedAvailability",
  "https://schema.org/SoldOut",
  "InStock", "OutOfStock", "PreOrder", "BackOrder"
];

// ============================================
// UTILITIES
// ============================================

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith("http")) {
    normalized = "https://" + normalized;
  }
  return normalized;
}

function getGrade(score: number): string {
  if (score >= 85) return "Agent-Native";
  if (score >= 70) return "Optimized";
  if (score >= 50) return "Needs Work";
  return "Invisible";
}

// ============================================
// FIRECRAWL INTEGRATION
// ============================================

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    metadata?: {
      title?: string;
      description?: string;
      sourceURL?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

async function scrapeWithFirecrawl(url: string): Promise<{ html: string; metadata: any }> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  
  if (!apiKey) {
    console.log("Firecrawl not configured, falling back to basic fetch");
    return await basicFetch(url);
  }

  try {
    console.log("Scraping with Firecrawl:", url);
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["html", "markdown"],
        onlyMainContent: false,
        waitFor: 3000, // Wait for JS rendering
      }),
    });

    const data: FirecrawlResponse = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("Firecrawl error:", data.error);
      return await basicFetch(url);
    }

    console.log("Firecrawl scrape successful");
    return {
      html: data.data?.html || "",
      metadata: data.data?.metadata || {},
    };
  } catch (error) {
    console.error("Firecrawl fetch failed:", error);
    return await basicFetch(url);
  }
}

async function basicFetch(url: string): Promise<{ html: string; metadata: any }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "AgentReadyBot/1.0 (+https://agentready.com)" },
    });
    clearTimeout(timeoutId);
    const html = await response.text();
    return { html, metadata: { statusCode: response.status } };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================
// PAGESPEED INSIGHTS INTEGRATION
// ============================================

interface PageSpeedMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  tti: number | null;
  speedIndex: number | null;
  performanceScore: number | null;
}

async function getPageSpeedMetrics(url: string): Promise<PageSpeedMetrics> {
  const apiKey = Deno.env.get("GOOGLE_PAGESPEED_API_KEY");
  
  const nullMetrics: PageSpeedMetrics = {
    lcp: null, fid: null, cls: null, tti: null, speedIndex: null, performanceScore: null
  };

  if (!apiKey) {
    console.log("PageSpeed API key not configured");
    return nullMetrics;
  }

  try {
    console.log("Fetching PageSpeed Insights for:", url);
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&strategy=mobile`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("PageSpeed API error:", response.status);
      return nullMetrics;
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    
    if (!lighthouse) {
      console.error("No Lighthouse data in response");
      return nullMetrics;
    }

    const audits = lighthouse.audits || {};
    
    return {
      lcp: audits["largest-contentful-paint"]?.numericValue || null,
      fid: audits["max-potential-fid"]?.numericValue || null,
      cls: audits["cumulative-layout-shift"]?.numericValue || null,
      tti: audits["interactive"]?.numericValue || null,
      speedIndex: audits["speed-index"]?.numericValue || null,
      performanceScore: Math.round((lighthouse.categories?.performance?.score || 0) * 100),
    };
  } catch (error) {
    console.error("PageSpeed fetch failed:", error);
    return nullMetrics;
  }
}

// ============================================
// ROBOTS.TXT & BOT ACCESS
// ============================================

function isBotAllowed(robotsTxt: string, botName: string): boolean {
  const lines = robotsTxt.split("\n");
  let currentAgent = "";
  const botRules: string[] = [];
  const wildcardRules: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith("user-agent:")) {
      currentAgent = trimmed.replace("user-agent:", "").trim();
    } else if (trimmed.startsWith("disallow:") || trimmed.startsWith("allow:")) {
      if (currentAgent === botName.toLowerCase()) {
        botRules.push(trimmed);
      } else if (currentAgent === "*") {
        wildcardRules.push(trimmed);
      }
    }
  }

  // Check specific bot rules first
  for (const rule of botRules) {
    if (rule === "disallow: /" || rule === "disallow:/") return false;
    if (rule === "allow: /" || rule === "allow:/") return true;
  }

  // Fall back to wildcard rules
  for (const rule of wildcardRules) {
    if (rule === "disallow: /" || rule === "disallow:/") return false;
  }

  return true;
}

type CheckStatus = "pass" | "partial" | "fail";

interface Check {
  id: string;
  name: string;
  category: string;
  status: CheckStatus;
  score: number;
  maxScore: number;
  details: string;
  data: any;
}

interface BotAccessResult {
  check: Check;
  rawRobotsTxt: string | null;
  botStatuses: Record<string, boolean>;
}

async function checkAiBotAccess(domain: string): Promise<BotAccessResult> {
  const check: Check = { 
    id: "D1", 
    name: "AI Bot Access", 
    category: "discovery", 
    status: "fail", 
    score: 0, 
    maxScore: 15, 
    details: "", 
    data: {}
  };

  let rawRobotsTxt: string | null = null;
  const botStatuses: Record<string, boolean> = {};

  try {
    const response = await fetch(`${domain}/robots.txt`, { 
      headers: { "User-Agent": "AgentReadyBot/1.0" } 
    });
    
    if (response.status === 404) {
      check.status = "pass"; 
      check.score = 15;
      check.details = "No robots.txt found — all bots allowed by default";
      CRITICAL_AI_BOTS.forEach(bot => botStatuses[bot] = true);
      return { check, rawRobotsTxt: null, botStatuses };
    }
    
    rawRobotsTxt = await response.text();
    
    // Check each critical bot
    for (const bot of CRITICAL_AI_BOTS) {
      botStatuses[bot] = isBotAllowed(rawRobotsTxt, bot);
    }

    const botsAllowed = Object.entries(botStatuses).filter(([, allowed]) => allowed).map(([name]) => name);
    const botsBlocked = Object.entries(botStatuses).filter(([, allowed]) => !allowed).map(([name]) => name);
    const allowedCount = botsAllowed.length;
    const totalBots = CRITICAL_AI_BOTS.length;

    check.data = { botsAllowed, botsBlocked, totalBots };

    if (allowedCount === totalBots) {
      check.status = "pass"; 
      check.score = 15; 
      check.details = `All ${totalBots} critical AI shopping bots allowed`;
    } else if (allowedCount >= totalBots * 0.7) {
      check.status = "partial"; 
      check.score = 10; 
      check.details = `${allowedCount}/${totalBots} bots allowed. Blocked: ${botsBlocked.slice(0, 3).join(", ")}${botsBlocked.length > 3 ? '...' : ''}`;
    } else if (allowedCount >= 1) {
      check.status = "partial"; 
      check.score = 5; 
      check.details = `Only ${allowedCount}/${totalBots} bots allowed. Major bots blocked.`;
    } else {
      check.status = "fail"; 
      check.score = 0; 
      check.details = `All critical AI shopping bots blocked`;
    }
  } catch (error) {
    check.status = "pass"; 
    check.score = 15; 
    check.details = "Could not fetch robots.txt — assuming all bots allowed";
    CRITICAL_AI_BOTS.forEach(bot => botStatuses[bot] = true);
  }

  return { check, rawRobotsTxt, botStatuses };
}

// ============================================
// SCHEMA EXTRACTION & DEEP VALIDATION
// ============================================

interface SchemaValidation {
  found: boolean;
  valid: boolean;
  schema: any | null;
  missingFields: string[];
  invalidFields: string[];
  warnings: string[];
}

function extractAllSchemas(html: string): any[] {
  const schemas: any[] = [];
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      if (json["@graph"]) {
        schemas.push(...(Array.isArray(json["@graph"]) ? json["@graph"] : [json["@graph"]]));
      } else if (Array.isArray(json)) {
        schemas.push(...json);
      } else {
        schemas.push(json);
      }
    } catch (e) {
      console.log("Failed to parse JSON-LD:", e);
    }
  }

  return schemas;
}

function findSchemaByType(schemas: any[], type: string): any | null {
  for (const schema of schemas) {
    const schemaType = schema["@type"];
    if (schemaType === type || (Array.isArray(schemaType) && schemaType.includes(type))) {
      return schema;
    }
  }
  return null;
}

function validateProductSchema(schemas: any[]): SchemaValidation {
  const productSchema = findSchemaByType(schemas, "Product");
  const result: SchemaValidation = {
    found: !!productSchema,
    valid: false,
    schema: productSchema,
    missingFields: [],
    invalidFields: [],
    warnings: []
  };

  if (!productSchema) return result;

  // Required fields for Product schema
  const requiredFields = ["name", "description", "image"];
  for (const field of requiredFields) {
    if (!productSchema[field]) {
      result.missingFields.push(field);
    }
  }

  // Validate offers
  if (!productSchema.offers) {
    result.missingFields.push("offers");
  } else {
    const offers = Array.isArray(productSchema.offers) ? productSchema.offers[0] : productSchema.offers;
    
    // Check price
    if (!offers.price && !offers.lowPrice) {
      result.missingFields.push("offers.price");
    }
    
    // Validate currency (ISO 4217)
    if (offers.priceCurrency) {
      if (!ISO_4217_CURRENCIES.includes(offers.priceCurrency.toUpperCase())) {
        result.invalidFields.push(`offers.priceCurrency (${offers.priceCurrency} is not valid ISO 4217)`);
      }
    } else {
      result.missingFields.push("offers.priceCurrency");
    }
    
    // Validate availability
    if (offers.availability) {
      const isValidAvailability = SCHEMA_AVAILABILITY_VALUES.some(v => 
        offers.availability.includes(v) || offers.availability === v
      );
      if (!isValidAvailability) {
        result.invalidFields.push(`offers.availability (${offers.availability} is not a valid schema.org value)`);
      }
    } else {
      result.warnings.push("offers.availability not specified");
    }
  }

  // Check for recommended fields
  if (!productSchema.sku && !productSchema.gtin && !productSchema.mpn) {
    result.warnings.push("No product identifier (sku, gtin, or mpn) found");
  }

  if (!productSchema.brand) {
    result.warnings.push("brand not specified");
  }

  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;
  return result;
}

function validateOfferSchema(schemas: any[], productSchema: any | null): SchemaValidation {
  // Offers can be nested in Product or standalone
  let offerSchema = findSchemaByType(schemas, "Offer") || findSchemaByType(schemas, "AggregateOffer");
  
  if (!offerSchema && productSchema?.offers) {
    offerSchema = Array.isArray(productSchema.offers) ? productSchema.offers[0] : productSchema.offers;
  }

  const result: SchemaValidation = {
    found: !!offerSchema,
    valid: false,
    schema: offerSchema,
    missingFields: [],
    invalidFields: [],
    warnings: []
  };

  if (!offerSchema) return result;

  // Validate price
  if (!offerSchema.price && !offerSchema.lowPrice && !offerSchema.highPrice) {
    result.missingFields.push("price");
  }

  // Validate currency
  if (offerSchema.priceCurrency) {
    if (!ISO_4217_CURRENCIES.includes(offerSchema.priceCurrency.toUpperCase())) {
      result.invalidFields.push(`priceCurrency (${offerSchema.priceCurrency})`);
    }
  } else {
    result.missingFields.push("priceCurrency");
  }

  // Validate availability
  if (offerSchema.availability) {
    const isValid = SCHEMA_AVAILABILITY_VALUES.some(v => 
      offerSchema.availability.includes(v) || offerSchema.availability === v
    );
    if (!isValid) {
      result.invalidFields.push(`availability enum invalid`);
    }
  }

  // Check seller
  if (!offerSchema.seller && !offerSchema.offeredBy) {
    result.warnings.push("No seller information");
  }

  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;
  return result;
}

function validateOrganizationSchema(schemas: any[]): SchemaValidation {
  const orgSchema = findSchemaByType(schemas, "Organization") || 
                    findSchemaByType(schemas, "LocalBusiness") ||
                    findSchemaByType(schemas, "Store");

  const result: SchemaValidation = {
    found: !!orgSchema,
    valid: false,
    schema: orgSchema,
    missingFields: [],
    invalidFields: [],
    warnings: []
  };

  if (!orgSchema) return result;

  // Required fields
  if (!orgSchema.name) result.missingFields.push("name");
  if (!orgSchema.url) result.missingFields.push("url");

  // Recommended fields
  if (!orgSchema.logo) result.warnings.push("logo not specified");
  if (!orgSchema.contactPoint && !orgSchema.telephone && !orgSchema.email) {
    result.warnings.push("No contact information");
  }
  if (!orgSchema.address) result.warnings.push("address not specified");

  result.valid = result.missingFields.length === 0 && result.invalidFields.length === 0;
  return result;
}

function validateReturnPolicySchema(schemas: any[]): SchemaValidation {
  const policySchema = findSchemaByType(schemas, "MerchantReturnPolicy");

  const result: SchemaValidation = {
    found: !!policySchema,
    valid: false,
    schema: policySchema,
    missingFields: [],
    invalidFields: [],
    warnings: []
  };

  if (!policySchema) return result;

  // Check for return window
  if (!policySchema.merchantReturnDays && !policySchema.returnPolicyCategory) {
    result.warnings.push("Return window not clearly specified");
  }

  // Validate return method
  if (!policySchema.returnMethod) {
    result.warnings.push("returnMethod not specified");
  }

  // Check return fees
  if (!policySchema.returnFees && !policySchema.returnShippingFeesAmount) {
    result.warnings.push("Return fees not specified");
  }

  result.valid = result.missingFields.length === 0;
  return result;
}

// ============================================
// CHECK FUNCTIONS
// ============================================

function checkProductSchemaDeep(schemas: any[]): { check: Check; validation: SchemaValidation } {
  const validation = validateProductSchema(schemas);
  const check: Check = { 
    id: "D2", 
    name: "Product Schema", 
    category: "discovery", 
    status: "fail", 
    score: 0, 
    maxScore: 15, 
    details: "", 
    data: {} 
  };

  if (!validation.found) {
    check.details = "No Product schema found — AI agents cannot read your product data";
    return { check, validation };
  }

  check.data = {
    missingFields: validation.missingFields,
    invalidFields: validation.invalidFields,
    warnings: validation.warnings
  };

  if (validation.valid && validation.warnings.length === 0) {
    check.status = "pass";
    check.score = 15;
    check.details = "Complete, valid Product schema with all recommended fields";
  } else if (validation.valid) {
    check.status = "pass";
    check.score = 13;
    check.details = `Valid Product schema. Minor improvements: ${validation.warnings.slice(0, 2).join(", ")}`;
  } else if (validation.missingFields.length <= 2) {
    check.status = "partial";
    check.score = 8;
    check.details = `Product schema found but missing: ${validation.missingFields.join(", ")}`;
  } else {
    check.status = "partial";
    check.score = 4;
    check.details = `Incomplete Product schema. Missing ${validation.missingFields.length} required fields`;
  }

  return { check, validation };
}

async function checkSitemap(domain: string): Promise<Check> {
  const check: Check = { 
    id: "D3", 
    name: "Sitemap Available", 
    category: "discovery", 
    status: "fail", 
    score: 0, 
    maxScore: 10, 
    details: "", 
    data: {} 
  };

  const sitemapUrls = [
    `${domain}/sitemap.xml`,
    `${domain}/sitemap_index.xml`,
    `${domain}/sitemap-index.xml`
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl, { 
        headers: { "User-Agent": "AgentReadyBot/1.0" } 
      });
      
      if (response.ok) {
        const content = await response.text();
        if (content.includes("<urlset") || content.includes("<sitemapindex")) {
          // Count URLs in sitemap
          const urlMatches = content.match(/<loc>/g);
          const urlCount = urlMatches ? urlMatches.length : 0;
          
          check.status = "pass"; 
          check.score = 10; 
          check.details = `Valid XML sitemap found (${urlCount} URLs indexed)`;
          check.data = { sitemapUrl, urlCount };
          return check;
        }
      }
    } catch (e) {
      // Continue to next sitemap location
    }
  }

  check.details = "No XML sitemap found — agents can't efficiently crawl your catalog";
  return check;
}

function checkPageSpeedWithMetrics(metrics: PageSpeedMetrics): Check {
  const check: Check = { 
    id: "N1", 
    name: "Page Speed (Core Web Vitals)", 
    category: "performance", 
    status: "fail", 
    score: 0, 
    maxScore: 15, 
    details: "", 
    data: {} 
  };

  if (metrics.performanceScore === null) {
    check.status = "partial";
    check.score = 8;
    check.details = "Could not measure — PageSpeed API unavailable";
    return check;
  }

  check.data = {
    performanceScore: metrics.performanceScore,
    lcp: metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : null,
    cls: metrics.cls?.toFixed(3) || null,
    tti: metrics.tti ? `${(metrics.tti / 1000).toFixed(1)}s` : null
  };

  // Google's thresholds: Good (>=90), Needs Improvement (50-89), Poor (<50)
  if (metrics.performanceScore >= 90) {
    check.status = "pass";
    check.score = 15;
    check.details = `Excellent performance (${metrics.performanceScore}/100). LCP: ${check.data.lcp || 'N/A'}`;
  } else if (metrics.performanceScore >= 70) {
    check.status = "pass";
    check.score = 12;
    check.details = `Good performance (${metrics.performanceScore}/100). LCP: ${check.data.lcp || 'N/A'}`;
  } else if (metrics.performanceScore >= 50) {
    check.status = "partial";
    check.score = 8;
    check.details = `Moderate performance (${metrics.performanceScore}/100). Agents may timeout.`;
  } else {
    check.status = "fail";
    check.score = 3;
    check.details = `Poor performance (${metrics.performanceScore}/100). Agents will likely abandon.`;
  }

  return check;
}

function checkOfferSchemaDeep(schemas: any[], productValidation: SchemaValidation): { check: Check; validation: SchemaValidation } {
  const validation = validateOfferSchema(schemas, productValidation.schema);
  const check: Check = { 
    id: "T1", 
    name: "Offer Schema (Pricing)", 
    category: "transaction", 
    status: "fail", 
    score: 0, 
    maxScore: 15, 
    details: "", 
    data: {}
  };

  if (!validation.found) {
    check.details = "No Offer schema found — agents cannot see pricing or availability";
    return { check, validation };
  }

  const priceValue = validation.schema?.price || validation.schema?.lowPrice;
  const currencyValue = validation.schema?.priceCurrency;

  check.data = {
    price: priceValue,
    currency: currencyValue,
    availability: validation.schema?.availability,
    issues: [...validation.missingFields, ...validation.invalidFields]
  };

  if (validation.valid) {
    check.status = "pass";
    check.score = 15;
    check.details = `Valid Offer schema with pricing (${currencyValue} ${priceValue})`;
  } else if (validation.missingFields.length === 1 && validation.invalidFields.length === 0) {
    check.status = "partial";
    check.score = 10;
    check.details = `Offer schema present but missing: ${validation.missingFields[0]}`;
  } else {
    check.status = "partial";
    check.score = 5;
    check.details = `Incomplete Offer schema. Issues: ${[...validation.missingFields, ...validation.invalidFields].join(", ")}`;
  }

  return { check, validation };
}

function checkHttps(url: string): Check {
  const isHttps = url.startsWith("https://");
  return { 
    id: "T2", 
    name: "HTTPS Security", 
    category: "transaction", 
    status: isHttps ? "pass" as CheckStatus : "fail" as CheckStatus,
    score: isHttps ? 5 : 0, 
    maxScore: 5, 
    details: isHttps ? "Site uses HTTPS — secure for transactions" : "Site does not use HTTPS — agents won't transact", 
    data: { isHttps } 
  };
}

function checkOrganizationSchemaDeep(schemas: any[]): { check: Check; validation: SchemaValidation } {
  const validation = validateOrganizationSchema(schemas);
  const check: Check = { 
    id: "R1", 
    name: "Organization Identity", 
    category: "trust", 
    status: "fail", 
    score: 0, 
    maxScore: 15, 
    details: "", 
    data: {} 
  };

  if (!validation.found) {
    check.details = "No Organization schema — agents can't verify your business identity";
    return { check, validation };
  }

  check.data = {
    name: validation.schema?.name,
    type: validation.schema?.["@type"],
    hasContact: !!(validation.schema?.contactPoint || validation.schema?.telephone || validation.schema?.email),
    warnings: validation.warnings
  };

  if (validation.valid && validation.warnings.length <= 1) {
    check.status = "pass";
    check.score = 15;
    check.details = `Complete Organization schema for "${validation.schema?.name}"`;
  } else if (validation.valid) {
    check.status = "pass";
    check.score = 12;
    check.details = `Organization schema found. Missing: ${validation.warnings.slice(0, 2).join(", ")}`;
  } else {
    check.status = "partial";
    check.score = 7;
    check.details = `Incomplete Organization schema. Missing: ${validation.missingFields.join(", ")}`;
  }

  return { check, validation };
}

function checkReturnPolicySchemaDeep(schemas: any[]): { check: Check; validation: SchemaValidation } {
  const validation = validateReturnPolicySchema(schemas);
  const check: Check = { 
    id: "R2", 
    name: "Return Policy Schema", 
    category: "trust", 
    status: "fail", 
    score: 0, 
    maxScore: 10, 
    details: "", 
    data: {} 
  };

  if (!validation.found) {
    check.details = "No MerchantReturnPolicy schema — agents can't verify return terms";
    return { check, validation };
  }

  check.data = {
    returnDays: validation.schema?.merchantReturnDays,
    returnMethod: validation.schema?.returnMethod,
    warnings: validation.warnings
  };

  if (validation.warnings.length === 0) {
    check.status = "pass";
    check.score = 10;
    const days = validation.schema?.merchantReturnDays;
    check.details = days ? `Complete return policy (${days} days)` : "Complete return policy schema";
  } else if (validation.warnings.length <= 2) {
    check.status = "partial";
    check.score = 6;
    check.details = `Return policy found but incomplete: ${validation.warnings[0]}`;
  } else {
    check.status = "partial";
    check.score = 3;
    check.details = "Return policy schema has multiple missing fields";
  }

  return { check, validation };
}

// ============================================
// RECOMMENDATIONS GENERATOR
// ============================================

function generateRecommendations(checks: any[], validations: Record<string, SchemaValidation>) {
  const recommendations: any[] = [];

  const recTemplates: Record<string, any> = {
    D1: { 
      priority: "critical", 
      title: "Allow AI shopping bots in robots.txt", 
      description: "Your robots.txt is blocking critical AI shopping agents like GPTBot and ClaudeBot.",
      howToFix: `Add these rules to your robots.txt file:

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /`
    },
    D2: { 
      priority: "high", 
      title: "Add complete Product schema markup", 
      description: "AI agents need structured product data to understand and recommend your products.",
      howToFix: `Add this JSON-LD to your product pages:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Your Product Name",
  "description": "Detailed product description",
  "image": "https://yoursite.com/image.jpg",
  "sku": "SKU123",
  "brand": {
    "@type": "Brand",
    "name": "Your Brand"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Your Store"
    }
  }
}
</script>`
    },
    D3: { 
      priority: "medium", 
      title: "Create an XML sitemap", 
      description: "A sitemap helps AI agents efficiently discover all your products.",
      howToFix: `Create a sitemap.xml at your root domain:

1. For Shopify: Settings → Files → Create sitemap (automatic)
2. For WordPress: Install Yoast SEO or RankMath
3. For custom sites: Generate using tools like screaming frog or xml-sitemaps.com

Submit to Google Search Console for faster indexing.`
    },
    N1: { 
      priority: "high", 
      title: "Improve page load speed", 
      description: "Slow pages cause AI agents to timeout before completing analysis.",
      howToFix: `Key optimizations:

1. Compress images (use WebP format, <100KB for thumbnails)
2. Enable browser caching
3. Minify CSS and JavaScript
4. Use a CDN (Cloudflare, Fastly)
5. Lazy load images below the fold
6. Reduce third-party scripts

Test with: pagespeed.web.dev`
    },
    T1: { 
      priority: "high", 
      title: "Add complete Offer schema with pricing", 
      description: "AI agents need structured pricing data to make purchase recommendations.",
      howToFix: `Ensure your Offer schema includes:

{
  "@type": "Offer",
  "price": "29.99",
  "priceCurrency": "USD",  // Must be valid ISO 4217
  "availability": "https://schema.org/InStock",
  "priceValidUntil": "2025-12-31",
  "seller": {
    "@type": "Organization",
    "name": "Your Store Name"
  }
}

Valid availability values:
- https://schema.org/InStock
- https://schema.org/OutOfStock
- https://schema.org/PreOrder`
    },
    T2: { 
      priority: "critical", 
      title: "Enable HTTPS", 
      description: "AI agents will not complete transactions on insecure sites.",
      howToFix: `Install an SSL certificate:

1. Many hosts offer free SSL (Let's Encrypt)
2. Shopify/Squarespace include SSL by default
3. Use Cloudflare for free SSL on any site

After installing, redirect all HTTP to HTTPS.`
    },
    R1: { 
      priority: "medium", 
      title: "Add Organization schema", 
      description: "Helps AI agents verify your business identity and build trust.",
      howToFix: `Add to your homepage:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-555-1234",
    "contactType": "customer service"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  }
}
</script>`
    },
    R2: { 
      priority: "high", 
      title: "Add MerchantReturnPolicy schema", 
      description: "AI agents verify return policies before recommending purchases.",
      howToFix: `Add to your product or policy pages:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MerchantReturnPolicy",
  "applicableCountry": "US",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 30,
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/FreeReturn"
}
</script>

Link from Product schema:
"hasMerchantReturnPolicy": { "@id": "#return-policy" }`
    },
  };

  for (const check of checks) {
    if (check.status === "pass") continue;
    
    const template = recTemplates[check.id];
    if (!template) continue;

    // Customize based on validation details
    const validation = validations[check.id];
    let customizedRec = { ...template, checkId: check.id, checkName: check.name };

    if (validation && validation.missingFields.length > 0) {
      customizedRec.description += ` Missing: ${validation.missingFields.join(", ")}.`;
    }

    if (validation && validation.invalidFields.length > 0) {
      customizedRec.description += ` Invalid: ${validation.invalidFields.join(", ")}.`;
    }

    recommendations.push(customizedRec);
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => 
    (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
    (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
  );

  return recommendations;
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    const normalizedUrl = normalizeUrl(url);
    const domain = new URL(normalizedUrl).origin;
    
    console.log("Starting analysis for:", normalizedUrl);

    // Parallel fetch: Firecrawl + PageSpeed + Robots + Sitemap
    const [scrapeResult, pageSpeedMetrics, botAccessResult, sitemapCheck] = await Promise.all([
      scrapeWithFirecrawl(normalizedUrl),
      getPageSpeedMetrics(normalizedUrl),
      checkAiBotAccess(domain),
      checkSitemap(domain)
    ]);

    const { html } = scrapeResult;
    
    // Extract all schemas from the page
    const schemas = extractAllSchemas(html);
    console.log(`Found ${schemas.length} schema objects`);

    // Deep validation checks
    const { check: d2, validation: productValidation } = checkProductSchemaDeep(schemas);
    const { check: t1, validation: offerValidation } = checkOfferSchemaDeep(schemas, productValidation);
    const { check: r1, validation: orgValidation } = checkOrganizationSchemaDeep(schemas);
    const { check: r2, validation: returnValidation } = checkReturnPolicySchemaDeep(schemas);
    
    // Other checks
    const n1 = checkPageSpeedWithMetrics(pageSpeedMetrics);
    const t2 = checkHttps(normalizedUrl);

    const checks = [
      botAccessResult.check, // D1
      d2,                     // D2
      sitemapCheck,           // D3
      n1,                     // N1
      t1,                     // T1
      t2,                     // T2
      r1,                     // R1
      r2                      // R2
    ];

    // Calculate scores
    const discoveryScore = botAccessResult.check.score + d2.score + sitemapCheck.score;
    const performanceScore = n1.score;
    const transactionScore = t1.score + t2.score;
    const trustScore = r1.score + r2.score;
    const totalScore = discoveryScore + performanceScore + transactionScore + trustScore;
    const grade = getGrade(totalScore);

    // Store validations for recommendations
    const validations: Record<string, SchemaValidation> = {
      D2: productValidation,
      T1: offerValidation,
      R1: orgValidation,
      R2: returnValidation
    };

    const recommendations = generateRecommendations(checks, validations);
    const analysisDuration = Date.now() - startTime;

    console.log(`Analysis complete: ${totalScore}/100 (${grade}) in ${analysisDuration}ms`);

    // Store in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.from("analyses").insert({
      url: normalizedUrl,
      domain: new URL(normalizedUrl).hostname,
      total_score: totalScore,
      grade,
      discovery_score: discoveryScore,
      discovery_max: 40,
      performance_score: performanceScore,
      performance_max: 15,
      transaction_score: transactionScore,
      transaction_max: 20,
      trust_score: trustScore,
      trust_max: 25,
      checks,
      recommendations,
      analysis_duration_ms: analysisDuration
    }).select("id").single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysisId: data.id,
        summary: {
          score: totalScore,
          grade,
          checksCount: checks.length,
          issuesCount: checks.filter(c => c.status !== "pass").length,
          durationMs: analysisDuration
        }
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
