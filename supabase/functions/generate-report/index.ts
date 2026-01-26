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
    case "discovery": return "Can AI Find You?";
    case "performance": return "Is Your Site Fast?";
    case "transaction": return "Can Agents Buy?";
    case "distribution": return "Protocol Ready?";
    case "trust": return "Will Agents Recommend?";
    default: return category;
  }
}

// Dynamic email subject based on score
function getEmailSubject(score: number, domain: string): string {
  if (score < 50) {
    return `⚠️ Your store is invisible to AI agents (Score: ${score}/100)`;
  } else if (score < 70) {
    return `Your store scored ${score}/100 for AI visibility — here's what to fix`;
  } else if (score < 85) {
    return `Good news: ${score}/100 AI readiness — here's how to reach 85+`;
  } else {
    return `🏆 Excellent! ${score}/100 — you're a market leader`;
  }
}

// Business impact statement based on score
function getBusinessImpactStatement(score: number): string {
  if (score < 50) {
    return "When customers ask AI assistants where to buy, you won't be in the conversation. This is a critical business risk as AI-referred traffic grows 4,700% YoY.";
  } else if (score < 70) {
    return "AI agents struggle to understand your products. You're losing potential customers to optimized competitors who are easier for AI to discover and recommend.";
  } else if (score < 85) {
    return "You're visible to most AI agents, but missing some opportunities. Top competitors are pulling ahead with better protocol compliance.";
  } else {
    return "AI agents can discover, understand, and recommend your products. You're positioned to capture the next wave of AI-referred shopping traffic.";
  }
}

// Revenue at risk messaging
function generateRevenueAtRiskHtml(score: number): string {
  const getRiskPercentage = () => {
    if (score < 50) return "25-40%";
    if (score < 70) return "15-25%";
    if (score < 85) return "5-15%";
    return "<5%";
  };

  const riskColor = score < 50 ? "#ef4444" : score < 70 ? "#f97316" : score < 85 ? "#eab308" : "#22c55e";

  return `
    <div style="margin-bottom: 30px; padding: 20px; background: #fef2f2; border-left: 4px solid ${riskColor};">
      <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Revenue at Risk</p>
      <p style="margin: 0 0 8px 0; font-size: 32px; font-weight: bold; color: ${riskColor};">${getRiskPercentage()}</p>
      <p style="margin: 0; font-size: 14px; color: #666;">of AI-referred customers may be missing your store. AI traffic is growing <strong>4,700% YoY</strong>.</p>
    </div>
  `;
}

// Industry comparison visualization
function generateIndustryComparisonHtml(score: number): string {
  const userBarWidth = Math.min(score, 100);
  const avgBarWidth = 62;
  const topBarWidth = 85;
  const userColor = score >= 85 ? "#22c55e" : score >= 70 ? "#3b82f6" : score >= 50 ? "#f97316" : "#ef4444";

  return `
    <div style="margin-bottom: 30px; padding: 20px; background: #f9fafb; border: 1px solid #e5e5e5;">
      <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">How You Compare</p>
      
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 14px; font-weight: 600;">Your Score</span>
          <span style="font-size: 14px; font-weight: 600;">${score}</span>
        </div>
        <div style="height: 8px; background: #e5e5e5; border-radius: 4px;">
          <div style="height: 100%; width: ${userBarWidth}%; background: ${userColor}; border-radius: 4px;"></div>
        </div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 14px; color: #666;">Industry Average</span>
          <span style="font-size: 14px; color: #666;">62</span>
        </div>
        <div style="height: 8px; background: #e5e5e5; border-radius: 4px;">
          <div style="height: 100%; width: ${avgBarWidth}%; background: #9ca3af; border-radius: 4px;"></div>
        </div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 14px; color: #666;">Top Performers</span>
          <span style="font-size: 14px; color: #666;">85+</span>
        </div>
        <div style="height: 8px; background: #e5e5e5; border-radius: 4px;">
          <div style="height: 100%; width: ${topBarWidth}%; background: #9ca3af; border-radius: 4px;"></div>
        </div>
      </div>
      
      ${score < 85 ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #666;">${score < 62 ? `You're ${62 - score} points below the industry average.` : `You need ${85 - score} more points to reach top performer status.`}</p>` : ''}
    </div>
  `;
}

// #1 Priority fix section
function generatePriorityFixHtml(recommendations: Recommendation[]): string {
  if (!recommendations || recommendations.length === 0) return '';
  
  const sorted = [...recommendations].sort((a, b) => {
    const order = { critical: 1, high: 2, medium: 3, low: 4 };
    return (order[a.priority] || 99) - (order[b.priority] || 99);
  });
  
  const topFix = sorted[0];
  const pointGain = topFix.priority === 'critical' ? 15 : topFix.priority === 'high' ? 10 : 5;
  
  return `
    <div style="margin-bottom: 40px; padding: 24px; background: #eff6ff; border: 2px solid #3b82f6;">
      <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #3b82f6; font-weight: 600;">#1 Priority Fix</p>
      <h2 style="margin: 0 0 12px 0; font-size: 20px;">${topFix.title}</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">${topFix.description}</p>
      
      <div style="display: flex; gap: 24px; margin-bottom: 16px;">
        <div>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Expected Gain</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #22c55e;">+${pointGain} pts</p>
        </div>
        <div>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Priority Level</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; text-transform: capitalize;">${topFix.priority}</p>
        </div>
      </div>
      
      <div style="background: #1a1a1a; color: #e5e5e5; padding: 16px; border-radius: 4px; overflow-x: auto;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">How to fix:</p>
        <pre style="margin: 0; font-size: 12px; white-space: pre-wrap; word-wrap: break-word;"><code>${(topFix.howToFix || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    </div>
  `;
}

// What 85+ unlocks
function generateWhatUnlocksHtml(): string {
  return `
    <div style="margin-bottom: 40px; padding: 24px; background: #f0fdf4; border: 1px solid #22c55e;">
      <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #22c55e; font-weight: 600;">The Destination</p>
      <h2 style="margin: 0 0 16px 0; font-size: 20px;">What an 85+ Score Unlocks</h2>
      
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="color: #22c55e;">✓</span>
          <div>
            <strong>ChatGPT Shopping</strong>
            <p style="margin: 0; font-size: 14px; color: #666;">Appear in ChatGPT's product recommendations</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="color: #22c55e;">✓</span>
          <div>
            <strong>Klarna APP Integration</strong>
            <p style="margin: 0; font-size: 14px; color: #666;">Get discovered by Klarna's 150M+ users</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="color: #22c55e;">✓</span>
          <div>
            <strong>Google AI Agents</strong>
            <p style="margin: 0; font-size: 14px; color: #666;">Surface in Google's AI Overviews and Shopping Graph</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="color: #22c55e;">✓</span>
          <div>
            <strong>Perplexity Shopping</strong>
            <p style="margin: 0; font-size: 14px; color: #666;">Be cited as a purchase option in AI search</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Market context stats
function generateMarketContextHtml(): string {
  return `
    <div style="margin-bottom: 40px; padding: 20px; background: #f9fafb; border: 1px solid #e5e5e5;">
      <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Market Context</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; width: 50%;">
            <p style="margin: 0; font-size: 24px; font-weight: bold;">4,700%</p>
            <p style="margin: 0; font-size: 12px; color: #666;">YoY growth in AI traffic</p>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
            <p style="margin: 0; font-size: 24px; font-weight: bold;">73%</p>
            <p style="margin: 0; font-size: 12px; color: #666;">of stores fail readiness</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <p style="margin: 0; font-size: 24px; font-weight: bold;">$17.5T</p>
            <p style="margin: 0; font-size: 12px; color: #666;">influenced by AI by 2030</p>
          </td>
          <td style="padding: 12px 0;">
            <p style="margin: 0; font-size: 24px; font-weight: bold;">2025</p>
            <p style="margin: 0; font-size: 12px; color: #666;">protocols launched</p>
          </td>
        </tr>
      </table>
    </div>
  `;
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

// Get grade label (updated)
function getGradeLabel(grade: string): string {
  switch (grade) {
    case "Agent-Native": return "MARKET LEADER";
    case "Optimized": return "COMPETITIVE";
    case "Needs Work": return "LOSING GROUND";
    case "Invisible": return "INVISIBLE TO AI AGENTS";
    default: return grade.toUpperCase();
  }
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

  // Generate behavioral science sections
  const businessImpact = getBusinessImpactStatement(analysis.total_score);
  const revenueAtRiskHtml = generateRevenueAtRiskHtml(analysis.total_score);
  const industryComparisonHtml = generateIndustryComparisonHtml(analysis.total_score);
  const priorityFixHtml = generatePriorityFixHtml(recommendations);
  const whatUnlocksHtml = generateWhatUnlocksHtml();
  const marketContextHtml = generateMarketContextHtml();
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

    <!-- PAGE 1: EXECUTIVE SUMMARY -->
    
    <!-- Score Overview -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 40px; margin-bottom: 30px; text-align: center;">
      <div style="font-size: 72px; font-weight: bold; margin-bottom: 8px;">${analysis.total_score}</div>
      <div style="font-size: 24px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">${getGradeLabel(analysis.grade)}</div>
      <div style="display: flex; justify-content: center; gap: 24px; font-size: 14px; margin-bottom: 20px;">
        <span>${passChecks.length} passed</span>
        <span>${partialChecks.length} partial</span>
        <span>${failChecks.length} failed</span>
      </div>
      <p style="margin: 0; font-size: 14px; opacity: 0.9; max-width: 500px; margin: 0 auto;">${businessImpact}</p>
    </div>

    <!-- Revenue at Risk + Industry Comparison -->
    ${revenueAtRiskHtml}
    ${industryComparisonHtml}

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
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">🔍 Can AI Find You? (35 pts)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.discovery_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${discoveryMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.discovery_score / discoveryMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">⚡ Is Your Site Fast? (15 pts)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.performance_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${performanceMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.performance_score / performanceMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">💳 Can Agents Buy? (20 pts)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.transaction_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${transactionMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.transaction_score / transactionMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">📡 Protocol Ready? (15 pts)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${distributionScore}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${distributionMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((distributionScore / distributionMax) * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">🛡️ Will Agents Recommend? (15 pts)</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${analysis.trust_score}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${trustMax}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Math.round((analysis.trust_score / trustMax) * 100)}%</td>
        </tr>
      </table>
    </div>

    <!-- Protocol Readiness -->
    ${protocolHtml}

    <!-- PAGE 2: #1 PRIORITY FIX -->
    ${priorityFixHtml}

    <!-- PAGE 3: DETAILED CHECKS -->
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

    <!-- PAGE 4: ALL RECOMMENDATIONS -->
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">All Recommendations</h2>
      ${recommendationsHtml}
    </div>

    <!-- PAGE 5: NEXT STEPS -->
    ${whatUnlocksHtml}
    ${marketContextHtml}

    <!-- Closing Statement -->
    <div style="margin-bottom: 40px; padding: 24px; background: #1a1a1a; color: white; text-align: center;">
      <p style="margin: 0 0 20px 0; font-size: 18px; font-style: italic;">"This is where commerce is heading. Will you be discovered, or will you be skipped?"</p>
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

    // Get dynamic subject line based on score
    const emailSubject = getEmailSubject(analysis.total_score, analysis.domain);

    // Send email with HTML report
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "re:found Labs <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
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
