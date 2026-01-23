import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

async function fetchWithTimeout(url: string, timeout: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "AgentReadyBot/1.0 (+https://agentready.com)" },
    });
    clearTimeout(timeoutId);
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

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

  for (const rule of botRules) {
    if (rule === "disallow: /" || rule === "disallow:/") return false;
    if (rule === "allow: /" || rule === "allow:/") return true;
  }

  for (const rule of wildcardRules) {
    if (rule === "disallow: /" || rule === "disallow:/") return false;
  }

  return true;
}

async function checkAiBotAccess(domain: string) {
  const check = { id: "D1", name: "AI Bot Access", category: "discovery", status: "fail", score: 0, maxScore: 15, details: "", data: {} };
  const criticalBots = ["OAI-SearchBot", "ChatGPT-User", "ClaudeBot"];

  try {
    const response = await fetch(`${domain}/robots.txt`, { headers: { "User-Agent": "AgentReadyBot/1.0" } });
    if (response.status === 404) {
      check.status = "pass"; check.score = 15;
      check.details = "No robots.txt found — all bots allowed by default";
      return check;
    }
    const content = await response.text();
    const botsAllowed = criticalBots.filter(bot => isBotAllowed(content, bot));
    const botsBlocked = criticalBots.filter(bot => !botsAllowed.includes(bot));

    if (botsAllowed.length === 3) { check.status = "pass"; check.score = 15; check.details = `All critical AI bots allowed`; }
    else if (botsAllowed.length >= 1) { check.status = "partial"; check.score = 8; check.details = `Some bots blocked: ${botsBlocked.join(", ")}`; }
    else { check.status = "fail"; check.score = 0; check.details = `All critical AI bots blocked`; }
  } catch { check.status = "pass"; check.score = 15; check.details = "Could not fetch robots.txt — assuming allowed"; }
  return check;
}

function checkProductSchema(html: string) {
  const check = { id: "D2", name: "Product Schema", category: "discovery", status: "fail", score: 0, maxScore: 15, details: "", data: {} };
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let productSchema = null;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      const schemas = json["@graph"] || [json];
      for (const schema of Array.isArray(schemas) ? schemas : [schemas]) {
        if (schema["@type"] === "Product" || (Array.isArray(schema["@type"]) && schema["@type"].includes("Product"))) {
          productSchema = schema; break;
        }
      }
    } catch {}
  }
  if (!productSchema) { check.details = "No Product schema found"; return check; }
  const required = ["name", "description", "image", "offers"];
  const hasAll = required.every(f => f === "offers" ? productSchema.offers : productSchema[f]);
  if (hasAll) { check.status = "pass"; check.score = 15; check.details = "Complete Product schema found"; }
  else { check.status = "partial"; check.score = 8; check.details = "Product schema incomplete"; }
  return check;
}

async function checkSitemap(domain: string) {
  const check = { id: "D3", name: "Sitemap Available", category: "discovery", status: "fail", score: 0, maxScore: 10, details: "", data: {} };
  try {
    const response = await fetch(`${domain}/sitemap.xml`, { headers: { "User-Agent": "AgentReadyBot/1.0" } });
    if (response.ok) {
      const content = await response.text();
      if (content.includes("<urlset") || content.includes("<sitemapindex")) {
        check.status = "pass"; check.score = 10; check.details = "Valid XML sitemap found";
        return check;
      }
    }
  } catch {}
  check.details = "No XML sitemap found";
  return check;
}

function checkPageSpeed() {
  // Simplified - would need PageSpeed API key for real check
  return { id: "N1", name: "Page Speed", category: "performance", status: "partial", score: 10, maxScore: 15, details: "Moderate performance assumed", data: {} };
}

function checkOfferSchema(html: string) {
  const check = { id: "T1", name: "Offer Schema", category: "transaction", status: "fail", score: 0, maxScore: 15, details: "", data: {} };
  if (html.includes('"@type":"Offer"') || html.includes('"@type": "Offer"') || html.includes('"price"')) {
    check.status = "pass"; check.score = 15; check.details = "Offer schema with pricing found";
  } else { check.details = "No Offer schema found"; }
  return check;
}

function checkHttps(url: string) {
  const isHttps = url.startsWith("https://");
  return { id: "T2", name: "HTTPS Security", category: "transaction", status: isHttps ? "pass" : "fail", score: isHttps ? 5 : 0, maxScore: 5, details: isHttps ? "Site uses HTTPS" : "Site does not use HTTPS", data: {} };
}

function checkOrganizationSchema(html: string) {
  const check = { id: "R1", name: "Organization Identity", category: "trust", status: "fail", score: 0, maxScore: 15, details: "", data: {} };
  if (html.includes('"@type":"Organization"') || html.includes('"@type": "Organization"') || html.includes('"@type":"LocalBusiness"')) {
    check.status = "pass"; check.score = 15; check.details = "Organization schema found";
  } else { check.details = "No Organization schema found"; }
  return check;
}

function checkReturnPolicySchema(html: string) {
  const check = { id: "R2", name: "Return Policy Schema", category: "trust", status: "fail", score: 0, maxScore: 10, details: "", data: {} };
  if (html.includes("MerchantReturnPolicy") || html.includes("returnPolicy")) {
    check.status = "pass"; check.score = 10; check.details = "Return policy schema found";
  } else { check.details = "No return policy schema found"; }
  return check;
}

function generateRecommendations(checks: any[]) {
  const recMap: Record<string, any> = {
    D1: { priority: "critical", title: "Allow AI shopping bots in robots.txt", description: "Your robots.txt is blocking AI agents.", howToFix: "Add User-agent: OAI-SearchBot\\nAllow: /" },
    D2: { priority: "high", title: "Add Product schema", description: "AI agents need structured product data.", howToFix: "Add JSON-LD Product schema with name, description, image, offers." },
    D3: { priority: "medium", title: "Add XML sitemap", description: "Helps agents discover your catalog.", howToFix: "Enable sitemap in your platform settings." },
    T1: { priority: "high", title: "Add Offer schema", description: "Agents need price and availability data.", howToFix: "Add Offer schema with price, priceCurrency, availability." },
    T2: { priority: "critical", title: "Enable HTTPS", description: "Agents won't transact on insecure sites.", howToFix: "Install an SSL certificate." },
    R1: { priority: "medium", title: "Add Organization schema", description: "Helps verify your business identity.", howToFix: "Add Organization schema with name, url, logo." },
    R2: { priority: "high", title: "Add return policy schema", description: "Agents verify policies before recommending.", howToFix: "Add MerchantReturnPolicy schema." },
  };
  return checks.filter(c => c.status !== "pass").map(c => ({ ...recMap[c.id], checkId: c.id, checkName: c.name })).filter(Boolean);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    const normalizedUrl = normalizeUrl(url);
    const domain = new URL(normalizedUrl).origin;
    const html = await fetchWithTimeout(normalizedUrl, 15000);

    const d1 = await checkAiBotAccess(domain);
    const d2 = checkProductSchema(html);
    const d3 = await checkSitemap(domain);
    const n1 = checkPageSpeed();
    const t1 = checkOfferSchema(html);
    const t2 = checkHttps(normalizedUrl);
    const r1 = checkOrganizationSchema(html);
    const r2 = checkReturnPolicySchema(html);

    const checks = [d1, d2, d3, n1, t1, t2, r1, r2];
    const discovery = d1.score + d2.score + d3.score;
    const performance = n1.score;
    const transaction = t1.score + t2.score;
    const trust = r1.score + r2.score;
    const total = discovery + performance + transaction + trust;
    const grade = getGrade(total);
    const recommendations = generateRecommendations(checks);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase.from("analyses").insert({
      url: normalizedUrl, domain: new URL(normalizedUrl).hostname, total_score: total, grade,
      discovery_score: discovery, performance_score: performance, transaction_score: transaction, trust_score: trust,
      checks, recommendations
    }).select("id").single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, analysisId: data.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
