import type { EngineeringRules, ReviewOptions, ReviewRules } from './types.js';

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

export async function createReview(options: ReviewOptions): Promise<string> {
  const {
    diff,
    prompt,
    rules,
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4096,
    comprehensive = false,
  } = options;

  const { hard, soft } = normalizeRules(rules);
  const truncatedDiff =
    diff.length > DIFF_LIMIT ? `${diff.substring(0, DIFF_LIMIT)}\n... [truncated]` : diff;

  const userMessage = `${prompt}

${formatRules('Hard Rules (Must Fix candidates — security, correctness, data loss)', hard)}
${formatRules('Soft Rules (Standards only — do not block merge)', soft)}
## Diff
\`\`\`diff
${truncatedDiff}
\`\`\`

Respond with a structured Markdown report using EXACTLY these sections:
# AI Review Report

## Must Fix
(Real bugs / security / data-loss with concrete failure mode, file:line, and suggested fix. "None found." if clean.)

## Standards
(Team rule violations that are not runtime bugs. "None found." if clean.)

## Suggestions
(Optional improvements. Skip style/docs/linter nits. "None found." if nothing material.)
${comprehensive ? '\n## Security Assessment\n## Test Coverage Assessment\n' : ''}
## Review Rules (follow strictly)
- Prioritize correctness, security, and concrete runtime failures.
- Do NOT report formatting, docs-only, or linter-catchable issues as Must Fix.
- Every Must Fix item must be independently verifiable from the diff.
- Be specific; reference file paths and line numbers where possible.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { content: Array<{ type: string; text?: string }> };
  return data.content.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('\n');
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
