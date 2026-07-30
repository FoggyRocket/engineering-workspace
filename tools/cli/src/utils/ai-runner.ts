import type { EngineeringRules } from './rules-loader.js';

export type ReviewRules = EngineeringRules | string[];

interface AiReviewOptions {
  diff: string;
  prompt: string;
  rules: ReviewRules;
  comprehensive?: boolean;
}

const DIFF_LIMIT = 12000;

function normalizeRules(rules: ReviewRules): EngineeringRules {
  if (Array.isArray(rules)) {
    return { hard: rules, soft: [] };
  }
  return rules;
}

function formatRules(title: string, rules: string[]): string {
  if (rules.length === 0) return '';
  return `## ${title}\n${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n`;
}

function buildOutputFormat(comprehensive: boolean): string {
  return `## Output Format
Respond with a structured Markdown report using EXACTLY these sections:
# AI Review Report

## Must Fix
(Real bugs, security holes, data-loss risks, correctness failures with a concrete failure mode.
Each item MUST include: file path, line or range if known, what breaks, under what condition, and a suggested fix.
Use "None found." if clean. ONLY list issues you would block a merge for.)

## Standards
(Team engineering-rule violations that are not runtime bugs — style prefs, docs, framework conventions.
Do not inflate these into Must Fix. Use "None found." if clean.)

## Suggestions
(Optional improvements. Skip style nits, formatting, docs-only comments, and anything a linter would catch.
Use "None found." if nothing material.)

${comprehensive ? `## Security Assessment
(Authentication, authorization, injection risks, secrets — only concrete risks from the diff.)

## Test Coverage Assessment
(Missing tests for changed critical paths / edge cases.)` : ''}

## Review Rules (follow strictly)
- Prioritize correctness, security, and concrete runtime/performance failures.
- Do NOT report: formatting, indentation, naming taste, missing JSDoc alone, compiler/linter warnings, or documentation-only gaps as Must Fix.
- Every Must Fix item must be independently verifiable from the diff (clear defect, not speculation).
- Be honest about severity: if it would not block merge, put it under Standards or Suggestions.
- Reference file paths and line numbers where possible.
- Pre-flight before escalating: (1) observable behavior change? (2) types/API actually allow the invented case? (3) already handled in the same diff? If no/no/yes → Suggestion only.
- Require reachability: name a real input where the guard fails, or do not mark Must Fix.
- Inspect return types/implementations — do not assume null/Option when helpers return sentinel objects (e.g. { exists: false }).
- Missing cache data ≠ null snapshot; pass snapshots through and let derive*Status helpers decide.
- If the change does not alter observable behavior, label it hygiene under Suggestions.
- Do not request features or paths the same PR already implements.
- For each finding include a minimal suggested patch (1–3 lines when possible), not diagnosis alone.`;
}

export async function runAiReview({
  diff,
  prompt,
  rules,
  comprehensive = false,
}: AiReviewOptions): Promise<string> {
  const { hard, soft } = normalizeRules(rules);
  const truncated =
    diff.length > DIFF_LIMIT
      ? `${diff.substring(0, DIFF_LIMIT)}\n... (diff truncated for context window)`
      : diff;

  const fullPrompt = `${prompt}

${formatRules('Hard Rules (Must Fix candidates — security, correctness, data loss)', hard)}
${formatRules('Soft Rules (Standards only — do not block merge)', soft)}
## Git Diff to Review
\`\`\`diff
${truncated}
\`\`\`

${buildOutputFormat(comprehensive)}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env['ANTHROPIC_API_KEY'] ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: fullPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI review API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as { content: Array<{ type: string; text?: string }> };
  const text = data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n');

  return text;
}

/** True when Must Fix (or legacy Critical Issues) lists real bullet findings. */
export function hasBlockingFindings(report: string): boolean {
  const sectionMatch = report.match(
    /##\s*(Must Fix|Critical Issues)\s*\n([\s\S]*?)(?=\n##\s|\n#$|$)/i,
  );
  if (!sectionMatch) return false;
  const body = sectionMatch[2] ?? '';
  if (/none found/i.test(body)) return false;
  return /^\s*[-*]\s+/m.test(body);
}
