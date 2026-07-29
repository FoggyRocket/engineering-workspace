import type { ReviewReport, ReviewIssue } from './types.js';

export function parseReviewReport(raw: string): ReviewReport {
  const issues: ReviewIssue[] = [];

  const extractItems = (section: string, severity: ReviewIssue['severity']) => {
    const regex = new RegExp(`## ${section}\\n([\\s\\S]*?)(?=##|$)`);
    const match = regex.exec(raw);
    if (!match?.[1]) return;
    const lines = match[1]
      .split('\n')
      .map((l) => l.replace(/^[-*]\s*/, '').trim())
      .filter((l) => l && !/^none found\.?$/i.test(l) && l.length > 3);
    lines.forEach((message) => issues.push({ severity, message }));
  };

  // New sections
  extractItems('Must Fix', 'must-fix');
  extractItems('Standards', 'standards');
  extractItems('Suggestions', 'suggestion');

  // Legacy sections (older reports)
  extractItems('Critical Issues', 'critical');
  extractItems('Warnings', 'warning');
  extractItems('Positive Notes', 'positive');

  const blockers = issues.filter(
    (i) => i.severity === 'must-fix' || i.severity === 'critical',
  );
  const standards = issues.filter(
    (i) => i.severity === 'standards' || i.severity === 'warning',
  );

  const summary =
    blockers.length > 0
      ? `⛔ ${blockers.length} Must Fix finding(s)`
      : standards.length > 0
        ? `⚠️ ${standards.length} Standards finding(s)`
        : '✅ No Must Fix findings';

  return {
    raw,
    issues,
    hasCritical: blockers.length > 0,
    hasWarnings: standards.length > 0,
    summary,
    generatedAt: new Date(),
  };
}
