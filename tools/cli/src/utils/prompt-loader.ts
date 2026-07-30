import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Workspace root relative to CLI dist/src
const WORKSPACE_ROOT = join(__dirname, '..', '..', '..', '..', '..');

export async function loadPrompt(type: string, projectType?: string): Promise<string> {
  const promptsDir = join(WORKSPACE_ROOT, 'docs', 'prompts');

  // Try project-type-specific prompt first
  if (projectType && projectType !== 'generic') {
    const specificPath = join(promptsDir, `${type}-${projectType}.md`);
    try {
      await access(specificPath);
      return await readFile(specificPath, 'utf-8');
    } catch { /* fall through */ }
  }

  // Fall back to generic prompt
  const genericPath = join(promptsDir, `${type}.md`);
  try {
    return await readFile(genericPath, 'utf-8');
  } catch {
    return getDefaultPrompt(type);
  }
}

function getDefaultPrompt(type: string): string {
  const prompts: Record<string, string> = {
    'ai-review': `You are a Principal Staff Engineer reviewing a git diff for merge-blocking issues.
Produce a structured report with:
- Must Fix (real bugs, security, data-loss — concrete failure mode + reachability required)
- Standards (team rule violations that are not runtime bugs)
- Suggestions (optional improvements / hygiene; skip style/docs/linter nits)

Pre-flight before Must Fix: observable behavior change? types/API allow the invented case?
already handled in the same diff? If no/no/yes → Suggestion only.
Do not escalate formatting, JSDoc-only gaps, framework preferences, or redundant guards to Must Fix.
Inspect return types (do not invent null). Include a minimal suggested patch per finding.`,
    'security': `You are a security engineer reviewing a code diff for vulnerabilities.
Focus on: injection attacks, authentication/authorization gaps, secrets exposure,
input validation, dependency risks, and OWASP Top 10. Be precise and actionable.
Report concrete risks under Must Fix; speculative hardening tips under Suggestions.
Require reachability and inspect types/API before escalating.`,
    'analytics': `You are a data engineering lead reviewing analytics instrumentation.
Check for: event naming consistency (snake_case), missing required properties,
PII exposure, tracking coverage gaps, and spec compliance.
PII exposure is Must Fix; naming consistency is Standards.`,
    'pr-check': `You are a Principal Engineer performing a comprehensive pre-merge review.
Evaluate correctness and security first (Must Fix), then standards compliance,
then optional suggestions. Apply the same pre-flight checklist: reachability,
types/API verification, and do not request paths already covered in the diff.
Do not block merge on style, docs-only gaps, or non-observable hygiene.`,
  };
  return prompts[type] ?? prompts['ai-review']!;
}
