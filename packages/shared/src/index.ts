// Scoring configuration
export const SCORING = {
  // Category weights (total = 100)
  discovery: { max: 35, weight: 0.35 },
  performance: { max: 15, weight: 0.15 },
  transaction: { max: 20, weight: 0.20 },
  distribution: { max: 15, weight: 0.15 },
  trust: { max: 15, weight: 0.15 },

  // Grade thresholds
  grades: {
    agentNative: { min: 85, label: 'Agent-Native', description: 'MARKET LEADER' },
    optimized: { min: 70, label: 'Optimized', description: 'COMPETITIVE' },
    needsWork: { min: 50, label: 'Needs Work', description: 'LOSING GROUND' },
    invisible: { min: 0, label: 'Invisible', description: 'INVISIBLE TO AI' },
  },
} as const;

// Check definitions
export const CHECKS = {
  // Discovery (35 points)
  D1: { id: 'D1', name: 'AI Bot Access', category: 'discovery', maxScore: 12 },
  D2: { id: 'D2', name: 'Product Schema', category: 'discovery', maxScore: 13 },
  D3: { id: 'D3', name: 'Sitemap Available', category: 'discovery', maxScore: 10 },

  // Performance (15 points)
  N1: { id: 'N1', name: 'Page Speed', category: 'performance', maxScore: 15 },

  // Transaction (20 points)
  T1: { id: 'T1', name: 'Offer Schema', category: 'transaction', maxScore: 15 },
  T2: { id: 'T2', name: 'HTTPS Security', category: 'transaction', maxScore: 5 },

  // Distribution (15 points)
  P1: { id: 'P1', name: 'Platform Detected', category: 'distribution', maxScore: 1 },
  P2: { id: 'P2', name: 'Structured Data Complete', category: 'distribution', maxScore: 3 },
  P3: { id: 'P3', name: 'Product Feed Exists', category: 'distribution', maxScore: 3 },
  P4: { id: 'P4', name: 'Feed Discoverable', category: 'distribution', maxScore: 2 },
  P5: { id: 'P5', name: 'Feed Accessible', category: 'distribution', maxScore: 2 },
  P6: { id: 'P6', name: 'Commerce API Indicators', category: 'distribution', maxScore: 2 },
  P7: { id: 'P7', name: 'Protocol Manifest', category: 'distribution', maxScore: 2 },

  // Trust (15 points)
  R1: { id: 'R1', name: 'Organization Identity', category: 'trust', maxScore: 10 },
  R2: { id: 'R2', name: 'Return Policy Schema', category: 'trust', maxScore: 5 },
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
export type CheckStatus = 'pass' | 'partial' | 'fail';
export type Grade = 'Agent-Native' | 'Optimized' | 'Needs Work' | 'Invisible';
export type CheckCategory = 'discovery' | 'performance' | 'transaction' | 'distribution' | 'trust';

export interface Check {
  id: string;
  name: string;
  category: CheckCategory;
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

export interface AnalysisResult {
  id: string;
  url: string;
  domain: string;
  totalScore: number;
  grade: Grade;
  discoveryScore: number;
  performanceScore: number;
  transactionScore: number;
  distributionScore: number;
  trustScore: number;
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
