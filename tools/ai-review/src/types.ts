export type IssueSeverity = 'must-fix' | 'standards' | 'suggestion' | 'critical' | 'warning' | 'positive';

export interface ReviewIssue {
  severity: IssueSeverity;
  message: string;
  file?: string;
  line?: number;
}

export interface ReviewReport {
  raw: string;
  issues: ReviewIssue[];
  hasCritical: boolean;
  hasWarnings: boolean;
  summary: string;
  generatedAt: Date;
}

export interface EngineeringRules {
  hard: string[];
  soft: string[];
}

export type ReviewRules = EngineeringRules | string[];

export interface ReviewOptions {
  diff: string;
  prompt: string;
  rules: ReviewRules;
  model?: string;
  maxTokens?: number;
  comprehensive?: boolean;
}
