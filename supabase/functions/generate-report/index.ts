import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Check {
  id: string;
  name: string;
  category: string;
  status: "pass" | "partial" | "fail";
  score: number;
  maxScore: number;
  details: string;
  data?: any;
}

interface Recommendation {
  checkId: string;
  checkName: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  howToFix: string;
}

interface AnalysisData {
  id: string;
  url: string;
  domain: string;
  total_score: number;
  grade: string;
  discovery_score: number;
  discovery_max: number;
  performance_score: number;
  performance_max: number;
  transaction_score: number;
  transaction_max: number;
  distribution_score: number;
  distribution_max: number;
  trust_score: number;
  trust_max: number;
  checks: Check[];
  recommendations: Recommendation[];
  created_at: string;
  protocol_compatibility?: any;
  platform_detected?: string;
  platform_name?: string;
  feeds_found?: any[];
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case "pass": return "✅";
    case "partial": return "⚠️";
    case "fail": return "❌";
    default: return "•";
  }
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "critical": return "🔴 Critical";
    case "high": return "🟠 High";
    case "medium": return "🟡 Medium";
    case "low": return "🟢 Low";
    default: return priority;
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "discovery": return "Discovery";
    case "performance": return "Performance";
    case "transaction": return "Transaction";
    case "distribution": return "Distribution";
    case "trust": return "Trust";
    default: return category;
  }
}

function generateProtocolReadinessHtml(protocolData: any): string {
  if (!protocolData) return '';
  
  const getStatusIcon = (status: string) => 
    status === 'ready' ? '✅' : status === 'partial' ? '⚠️' : '❌';
  
  const discovery = protocolData.discovery || {};
  const commerce = protocolData.commerce || {};
  const payments = protocolData.payments || { rails: [] };
  
  const paymentRails = payments.rails || [];
  
  return `
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Protocol Readiness</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><th colspan="2" style="text-align: left; padding: 12px; background: #f5f5f5; font-weight: 600;">Discovery Layer</th></tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">Google Shopping</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(discovery.googleShopping?.status || 'unknown')} ${discovery.googleShopping?.reason || 'Not assessed'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">Klarna APP</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(discovery.klarnaApp?.status || 'unknown')} ${discovery.klarnaApp?.reason || 'Not assessed'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">Answer Engines</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(discovery.answerEngines?.status || 'unknown')} ${discovery.answerEngines?.reason || 'Not assessed'}</td>
        </tr>
        <tr><th colspan="2" style="text-align: left; padding: 12px; background: #f5f5f5; font-weight: 600;">Commerce Layer</th></tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">UCP (Universal Commerce)</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(commerce.ucp?.status || 'unknown')} ${commerce.ucp?.reason || 'Not assessed'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">ACP (ChatGPT Shopping)</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(commerce.acp?.status || 'unknown')} ${commerce.acp?.reason || 'Not assessed'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">MCP (Model Context)</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(commerce.mcp?.status || 'unknown')} ${commerce.mcp?.reason || 'Not assessed'}</td>
        </tr>
        ${paymentRails.length > 0 ? `
          <tr><th colspan="2" style="text-align: left; padding: 12px; background: #f5f5f5; font-weight: 600;">Payment Rails Detected</th></tr>
          <tr>
            <td colspan="2" style="padding: 12px;">
              ${paymentRails.map((rail: string) => 
                rail === 'stripe' ? '💳 Stripe' : 
                rail === 'shopifyCheckout' ? '🛒 Shopify Checkout' :
                rail === 'googlePay' ? '🔷 Google Pay' :
                rail === 'applePay' ? '🍎 Apple Pay' :
                rail === 'klarna' ? '🟣 Klarna' :
                rail === 'paypal' ? '💙 PayPal' : rail
              ).join(' &nbsp;•&nbsp; ')}
            </td>
          </tr>
        ` : ''}
      </table>
    </div>
  `;
}

function generateHtmlReport(analysis: AnalysisData): string {
  // Null-safety: ensure arrays exist
  const checks = Array.isArray(analysis.checks) ? analysis.checks : [];
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  
  const passChecks = checks.filter(c => c.status === "pass");
  const partialChecks = checks.filter(c => c.status === "partial");
  const failChecks = checks.filter(c => c.status === "fail");

  // Safe score calculations with fallbacks
  const discoveryMax = analysis.discovery_max || 35;
  const performanceMax = analysis.performance_max || 15;
  const transactionMax = analysis.transaction_max || 20;
  const distributionMax = analysis.distribution_max || 15;
  const trustMax = analysis.trust_max || 15;
  
  const distributionScore = analysis.distribution_score || 0;

  const checksHtml = checks.map(check => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <span style="font-size: 16px;">${getStatusEmoji(check.status)}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <strong>${check.name}</strong>
        <div style="color: #666; font-size: 13px; margin-top: 4px;">${getCategoryLabel(check.category)}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; font-size: 13px;">
        ${check.details}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
        <strong>${check.score}</strong>/${check.maxScore}
      </td>
    </tr>
  `).join("");

  const recommendationsHtml = recommendations.map(rec => `
    <div style="margin-bottom: 24px; padding: 20px; background: #fafafa; border-left: 4px solid ${rec.priority === 'critical' ? '#ef4444' : rec.priority === 'high' ? '#f97316' : rec.priority === 'medium' ? '#eab308' : '#22c55e'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px;">${rec.title}</h3>
        <span style="font-size: 12px; font-weight: 600;">${getPriorityLabel(rec.priority)}</span>
      </div>
      <p style="color: #666; margin: 0 0 12px 0; font-size: 14px;"><strong>Why it matters:</strong> ${rec.description || ''}</p>
      <div style="margin-bottom: 12px;">
        <strong style="font-size: 14px;">How to fix:</strong>
        <pre style="background: #1a1a1a; color: #e5e5e5; padding: 16px; border-radius: 4px; overflow-x: auto; font-size: 12px; margin-top: 8px; white-space: pre-wrap; word-wrap: break-word;"><code>${(rec.howToFix || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    </div>
  `).join("");

  // Generate protocol readiness section
  const protocolHtml = generateProtocolReadinessHtml(analysis.protocol_compatibility);

  // Platform info
  const platformInfo = analysis.platform_name ? 
    `<p style="color: #666; font-size: 14px; margin: 4px 0;">Platform: <strong>${analysis.platform_name}</strong></p>` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Commerce Readiness Report - ${analysis.domain}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    h1, h2, h3 { margin: 0; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px; background: #f5f5f5; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 2px solid #e5e5e5;">
      <h1 style="font-size: 28px; margin-bottom: 8px;">AI Commerce Readiness Report</h1>
      <p style="color: #666; font-size: 16px; margin: 0;">${analysis.url}</p>
      ${platformInfo}
      <p style="color: #999; font-size: 14px; margin: 8px 0 0 0;">Generated on ${new Date(analysis.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Score Overview -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 40px; margin-bottom: 40px; text-align: center;">
      <div style="font-size: 72px; font-weight: bold; margin-bottom: 8px;">${analysis.total_score}</div>
      <div style="font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">${analysis.grade}</div>
      <div style="display: flex; justify-content: center; gap: 24px; font-size: 14px;">
        <span>${passChecks.length} passed</span>
        <span>${partialChecks.length} partial</span>
        <span>${failChecks.length} failed</span>
      </div>
    </div>

    <!-- Category Breakdown - 5 Pillars -->
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Score Breakdown</h2>
      <table>
        <tr>
          <th>Category</th>
          <th style="text-align: center;">Score</th>
          <th style="text-align: center;">Max</th>
          <th style="text-align: center;">%</th>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">🔍 Discovery (35 points)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.discovery_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${discoveryMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.discovery_score / discoveryMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">⚡ Performance (15 points)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.performance_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${performanceMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.performance_score / performanceMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">💳 Transaction (20 points)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.transaction_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${transactionMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.transaction_score / transactionMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">📡 Distribution (15 points)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${distributionScore}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${distributionMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((distributionScore / distributionMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">🛡️ Trust (15 points)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.trust_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${trustMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.trust_score / trustMax) * 100)}%</td>
        </tr>
      </table>
    </div>

    <!-- Protocol Readiness -->
    ${protocolHtml}

    <!-- Detailed Checks -->
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Detailed Check Results</h2>
      <table>
        <tr>
          <th style="width: 50px;">Status</th>
          <th>Check</th>
          <th>Details</th>
          <th style="width: 80px; text-align: center;">Score</th>
        </tr>
        ${checksHtml}
      </table>
    </div>

    <!-- Recommendations -->
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Recommendations</h2>
      ${recommendationsHtml}
    </div>

    <!-- AI Bots Checked -->
    <div style="margin-bottom: 40px; padding: 20px; background: #f9f9f9; border: 1px solid #e5e5e5;">
      <h3 style="font-size: 16px; margin: 0 0 12px 0;">AI Bots Analyzed</h3>
      <p style="font-size: 13px; color: #666; margin: 0;">
        GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Anthropic-AI, PerplexityBot, Google-Extended, Amazonbot, Applebot-Extended, Bytespider
      </p>
    </div>

    <!-- Service Tiers -->
    <div style="margin-bottom: 40px; padding: 24px; background: #1a1a1a; color: white;">
      <h3 style="font-size: 18px; margin: 0 0 16px 0; text-align: center;">Want to Improve Your Score?</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #ccc;">Free Audit</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; font-weight: bold;">€0</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #ccc;">Deep Audit + Simulation</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; font-weight: bold;">From €750</td>
        </tr>
        <tr>
          <td style="padding: 12px; color: #ccc;">Implementation</td>
          <td style="padding: 12px; text-align: right; font-weight: bold;">From €2,500</td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #999; margin: 16px 0 0 0; text-align: center;">
        Visit refoundlabs.com/services to learn more
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 40px; border-top: 2px solid #e5e5e5; color: #999; font-size: 13px;">
      <p>Generated by re:found Labs</p>
      <p>Agent Pulse - AI Commerce Readiness Assessment</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, analysisId } = await req.json();

    if (!email || !analysisId) {
      return new Response(
        JSON.stringify({ error: "Missing email or analysisId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the analysis data
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (fetchError || !analysis) {
      console.error("Failed to fetch analysis:", fetchError);
      return new Response(
        JSON.stringify({ error: "Analysis not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate HTML report
    const htmlReport = generateHtmlReport(analysis as AnalysisData);

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Send email with HTML report
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "re:found Labs <onboarding@resend.dev>",
      to: [email],
      subject: `Agent Pulse Report: ${analysis.domain} - Score ${analysis.total_score}/100`,
      html: htmlReport,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      
      // Update email_captures with error
      await supabase
        .from("email_captures")
        .update({ report_error: emailError.message })
        .eq("analysis_id", analysisId)
        .eq("email", email);

      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update email_captures with success timestamp
    await supabase
      .from("email_captures")
      .update({ report_sent_at: new Date().toISOString() })
      .eq("analysis_id", analysisId)
      .eq("email", email);

    console.log("Report sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Report sent successfully",
        emailId: emailData?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in generate-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
