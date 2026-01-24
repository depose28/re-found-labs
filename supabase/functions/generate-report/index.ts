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
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  impact: string;
  steps: string[];
  codeSnippet?: string;
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
  trust_score: number;
  trust_max: number;
  checks: Check[];
  recommendations: Recommendation[];
  created_at: string;
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
    case "trust": return "Trust";
    default: return category;
  }
}

function generateHtmlReport(analysis: AnalysisData): string {
  const passChecks = analysis.checks.filter(c => c.status === "pass");
  const partialChecks = analysis.checks.filter(c => c.status === "partial");
  const failChecks = analysis.checks.filter(c => c.status === "fail");

  const checksHtml = analysis.checks.map(check => `
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

  const recommendationsHtml = analysis.recommendations.map(rec => `
    <div style="margin-bottom: 24px; padding: 20px; background: #fafafa; border-left: 4px solid ${rec.priority === 'critical' ? '#ef4444' : rec.priority === 'high' ? '#f97316' : rec.priority === 'medium' ? '#eab308' : '#22c55e'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px;">${rec.title}</h3>
        <span style="font-size: 12px; font-weight: 600;">${getPriorityLabel(rec.priority)}</span>
      </div>
      <p style="color: #666; margin: 0 0 12px 0; font-size: 14px;"><strong>Impact:</strong> ${rec.impact}</p>
      <div style="margin-bottom: 12px;">
        <strong style="font-size: 14px;">How to fix:</strong>
        <ol style="margin: 8px 0 0 0; padding-left: 20px;">
          ${rec.steps.map(step => `<li style="margin-bottom: 6px; font-size: 13px;">${step}</li>`).join("")}
        </ol>
      </div>
      ${rec.codeSnippet ? `
        <div style="margin-top: 12px;">
          <strong style="font-size: 14px;">Code example:</strong>
          <pre style="background: #1a1a1a; color: #e5e5e5; padding: 16px; border-radius: 4px; overflow-x: auto; font-size: 12px; margin-top: 8px;"><code>${rec.codeSnippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
      ` : ""}
    </div>
  `).join("");

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

    <!-- Category Breakdown -->
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
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">🔍 Discovery</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.discovery_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.discovery_max}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.discovery_score / analysis.discovery_max) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">⚡ Performance</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.performance_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.performance_max}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.performance_score / analysis.performance_max) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">💳 Transaction</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.transaction_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.transaction_max}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.transaction_score / analysis.transaction_max) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">🛡️ Trust</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.trust_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.trust_max}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.trust_score / analysis.trust_max) * 100)}%</td>
        </tr>
      </table>
    </div>

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

    <!-- Footer -->
    <div style="text-align: center; padding-top: 40px; border-top: 2px solid #e5e5e5; color: #999; font-size: 13px;">
      <p>Generated by Re:found Labs</p>
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
      from: "Re:found Labs <onboarding@resend.dev>",
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
