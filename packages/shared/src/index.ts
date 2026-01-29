// Scoring configuration — 3-Layer Model (v2)
// Layer 1: Discovery (45pts) — "Can agents FIND you?"
// Layer 2: Trust (25pts) — "Can agents RECOMMEND you?"
// Layer 3: Transaction (30pts) — "Can agents BUY?"
export const SCORING = {
  // Layer scores (total = 100)
  discovery: { max: 45, weight: 0.45 },
  trust: { max: 25, weight: 0.25 },
  transaction: { max: 30, weight: 0.30 },

  // Deprecated: kept for backward compat with v1 analyses
  performance: { max: 0, weight: 0 },
  distribution: { max: 0, weight: 0 },

  // Grade thresholds
  grades: {
    agentNative: { min: 85, label: 'Agent-Native', description: 'MARKET LEADER' },
    optimized: { min: 70, label: 'Optimized', description: 'COMPETITIVE' },
    needsWork: { min: 50, label: 'Needs Work', description: 'LOSING GROUND' },
    invisible: { min: 0, label: 'Invisible', description: 'INVISIBLE TO AI' },
  },
} as const;

// Check definitions — 3-Layer Model
export const CHECKS = {
  // === Layer 1: Discovery (45 pts) ===

  // Crawl Architecture (15 pts)
  D1: { id: 'D1', name: 'AI Bot Access', category: 'discovery', maxScore: 7, subcategory: 'crawl' },
  D2: { id: 'D2', name: 'Sitemap Available', category: 'discovery', maxScore: 5, subcategory: 'crawl' },
  D3: { id: 'D3', name: 'Server Response Time', category: 'discovery', maxScore: 3, subcategory: 'crawl' },

  // Semantic Data (20 pts)
  D4: { id: 'D4', name: 'Product Schema', category: 'discovery', maxScore: 10, subcategory: 'semantic' },
  D5: { id: 'D5', name: 'WebSite Schema', category: 'discovery', maxScore: 5, subcategory: 'semantic' },
  D6: { id: 'D6', name: 'Attribute Completeness', category: 'discovery', maxScore: 5, subcategory: 'semantic', phase: 2 },

  // Distribution Signals (10 pts)
  D7: { id: 'D7', name: 'Product Feed', category: 'discovery', maxScore: 4, subcategory: 'distribution' },
  D8: { id: 'D8', name: 'Channel Detection', category: 'discovery', maxScore: 3, subcategory: 'distribution', phase: 2 },
  D9: { id: 'D9', name: 'Commerce API', category: 'discovery', maxScore: 3, subcategory: 'distribution' },
  D10: { id: 'D10', name: 'SSR Detection', category: 'discovery', maxScore: 3, subcategory: 'crawl', phase: 2 },

  // === Layer 2: Trust (25 pts) ===

  // Brand Identity (15 pts)
  T1: { id: 'T1', name: 'Organization Schema', category: 'trust', maxScore: 8, subcategory: 'brand' },
  T2: { id: 'T2', name: 'Trust Signals', category: 'trust', maxScore: 7, subcategory: 'brand' },

  // Community Signals (10 pts) — manual verification
  T3: { id: 'T3', name: 'Social Proof', category: 'trust', maxScore: 0, subcategory: 'community', manual: true },
  T4: { id: 'T4', name: 'Platform Presence', category: 'trust', maxScore: 0, subcategory: 'community', manual: true },

  // === Layer 3: Transaction (30 pts) ===

  // Protocol Support (20 pts)
  X1: { id: 'X1', name: 'UCP Compliance', category: 'transaction', maxScore: 10, subcategory: 'protocol' },
  X2: { id: 'X2', name: 'MCP/ACP Detection', category: 'transaction', maxScore: 5, subcategory: 'protocol', phase: 2 },
  X3: { id: 'X3', name: 'Payment Protocol', category: 'transaction', maxScore: 5, subcategory: 'protocol', phase: 2 },

  // Payment Infrastructure (10 pts)
  X4: { id: 'X4', name: 'Payment Methods', category: 'transaction', maxScore: 5, subcategory: 'payment' },
  X5: { id: 'X5', name: 'Checkout API', category: 'transaction', maxScore: 5, subcategory: 'payment', phase: 2 },
} as const;

// AI bots to check
export const CRITICAL_AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Anthropic-AI',
  'PerplexityBot',
  'Google-Extended',
  'Amazonbot',
  'Applebot-Extended',
  'Bytespider',
] as const;

// Valid ISO 4217 currencies (common ones)
export const ISO_4217_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD',
  'SEK', 'KRW', 'NOK', 'NZD', 'INR', 'MXN', 'TWD', 'ZAR', 'BRL', 'DKK',
  'PLN', 'CZK', 'HUF', 'RON', 'TRY', 'RUB', 'ILS', 'AED', 'SAR', 'THB',
] as const;

// Valid schema.org availability values
export const SCHEMA_AVAILABILITY_VALUES = [
  'https://schema.org/InStock',
  'https://schema.org/OutOfStock',
  'https://schema.org/PreOrder',
  'https://schema.org/BackOrder',
  'https://schema.org/Discontinued',
  'https://schema.org/InStoreOnly',
  'https://schema.org/OnlineOnly',
  'https://schema.org/LimitedAvailability',
  'https://schema.org/SoldOut',
  'InStock', 'OutOfStock', 'PreOrder', 'BackOrder',
] as const;

// Types
export type CheckStatus = 'pass' | 'partial' | 'fail' | 'skipped';
export type Grade = 'Agent-Native' | 'Optimized' | 'Needs Work' | 'Invisible';
export type CheckCategory = 'discovery' | 'trust' | 'transaction';
export type CheckSubcategory = 'crawl' | 'semantic' | 'distribution' | 'brand' | 'community' | 'protocol' | 'payment';
export type ScoringModel = 'v1_5pillar' | 'v2_3layer';

export interface Check {
  id: string;
  name: string;
  category: CheckCategory;
  subcategory?: CheckSubcategory;
  status: CheckStatus;
  score: number;
  maxScore: number;
  details: string;
  data?: Record<string, unknown>;
}

export interface Recommendation {
  checkId: string;
  checkName: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  howToFix: string;
}

export interface ManualChecklistItem {
  id: string;
  name: string;
  description: string;
  checkUrl?: string;
  category: 'trust' | 'transaction';
}

export const MANUAL_CHECKLIST: ManualChecklistItem[] = [
  {
    id: 'MC1',
    name: 'Klarna APP Enrollment',
    description: 'Check if you are enrolled in the Klarna Agent Purchase Protocol (not the same as Klarna payment scripts)',
    checkUrl: 'https://docs.klarna.com/agentic-commerce/',
    category: 'transaction',
  },
  {
    id: 'MC2',
    name: 'Google AI Mode Shopping',
    description: 'Verify your products appear in Google AI Mode shopping results',
    checkUrl: 'https://merchants.google.com/',
    category: 'trust',
  },
  {
    id: 'MC3',
    name: 'ChatGPT Shopping Integration',
    description: 'Check if ChatGPT can surface your products for purchase',
    checkUrl: 'https://chat.openai.com/',
    category: 'transaction',
  },
  {
    id: 'MC4',
    name: 'Reddit Brand Presence',
    description: 'Search Reddit for brand mentions and community engagement',
    checkUrl: 'https://www.reddit.com/search/',
    category: 'trust',
  },
  {
    id: 'MC5',
    name: 'Trustpilot Profile',
    description: 'Verify your Trustpilot business profile is claimed and active',
    checkUrl: 'https://business.trustpilot.com/',
    category: 'trust',
  },
];

export interface AnalysisResult {
  id: string;
  url: string;
  domain: string;
  totalScore: number;
  grade: Grade;
  scoringModel: ScoringModel;
  discoveryScore: number;
  trustScore: number;
  transactionScore: number;
  // Deprecated (v1 compat, always 0 in v2)
  performanceScore: number;
  distributionScore: number;
  checks: Check[];
  recommendations: Recommendation[];
  createdAt: string;
  durationMs: number;
}

// Helper functions
export function getGrade(score: number): Grade {
  if (score >= SCORING.grades.agentNative.min) return 'Agent-Native';
  if (score >= SCORING.grades.optimized.min) return 'Optimized';
  if (score >= SCORING.grades.needsWork.min) return 'Needs Work';
  return 'Invisible';
}

export function getGradeColor(grade: Grade): string {
  switch (grade) {
    case 'Agent-Native': return '#22c55e'; // green
    case 'Optimized': return '#3b82f6'; // blue
    case 'Needs Work': return '#f97316'; // orange
    case 'Invisible': return '#ef4444'; // red
  }
}
