import { readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ProjectType } from './project-detector.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, '..', '..', '..', '..', '..');

/** Bugs / security / correctness — candidates for Must Fix and merge blockers. */
const GLOBAL_HARD_RULES = [
  'No hardcoded credentials, API keys, or secrets',
  'All user inputs must be validated before use',
  'All async operations must handle errors (no unhandled rejections)',
  'Database queries must be parameterized (no string-concatenated SQL)',
  'Routes that mutate data must enforce authentication/authorization',
  'Do not log secrets, tokens, passwords, or PII',
];

/** Team standards — report under Standards; do not treat as merge blockers. */
const GLOBAL_SOFT_RULES = [
  'All exported functions should have JSDoc comments',
  'No console.log in production code (use structured logger)',
  'TypeScript strict mode should be enabled',
  'Tests required for business-critical logic',
  'No direct DOM manipulation in React components',
  'Use environment variables for all configuration',
  'All API responses should be typed',
];

const PROJECT_HARD_RULES: Record<string, string[]> = {
  nextjs: [
    'Server Actions and API routes must validate inputs (e.g. Zod) before side effects',
    'Do not expose server-only secrets or env vars to Client Components',
  ],
  react: [
    'Do not fetch with credentials or tokens in a way that leaks them to the client',
  ],
  'node-api': [
    'All routes that mutate data must have authentication middleware',
    'Use Zod or similar for request validation on public endpoints',
    'Rate limiting required on public endpoints',
  ],
  generic: [],
};

const PROJECT_SOFT_RULES: Record<string, string[]> = {
  nextjs: [
    'Use Server Components by default; Client Components only when necessary',
    'Prefer Server Actions or API routes over fetch() in Client Components',
    'Images should use next/image with explicit width/height',
    'Pages should export metadata or generateMetadata',
    'Use next/font for font loading',
    'Avoid useEffect for initial data fetching — prefer Server Components or React Query',
  ],
  react: [
    'Custom hooks must start with "use"',
    'Avoid prop drilling more than 2 levels — use context or a state manager',
    'Memoize only expensive computations when profiling justifies it',
    'Component files should export only one primary component',
    'Use React.lazy for route-level code splitting',
  ],
  'node-api': [
    'API responses should follow a consistent shape: { data, error, meta }',
    'Log request IDs for traceability',
  ],
  generic: [],
};

export interface EngineeringRules {
  hard: string[];
  soft: string[];
}

export async function loadRules(projectType?: ProjectType): Promise<EngineeringRules> {
  const hard = [...GLOBAL_HARD_RULES];
  const soft = [...GLOBAL_SOFT_RULES];

  if (projectType && projectType in PROJECT_HARD_RULES) {
    hard.push(...(PROJECT_HARD_RULES[projectType] ?? []));
  }
  if (projectType && projectType in PROJECT_SOFT_RULES) {
    soft.push(...(PROJECT_SOFT_RULES[projectType] ?? []));
  }

  const standardsDir = join(WORKSPACE_ROOT, 'docs', 'standards');
  const customRulesPath = join(standardsDir, 'custom-rules.txt');
  try {
    await access(customRulesPath);
    const custom = await readFile(customRulesPath, 'utf-8');
    // Custom rules default to soft (team prefs) unless prefixed with [hard]
    for (const raw of custom.split('\n').map((l) => l.trim()).filter(Boolean)) {
      if (raw.startsWith('[hard]')) {
        hard.push(raw.replace(/^\[hard\]\s*/, ''));
      } else {
        soft.push(raw.replace(/^\[soft\]\s*/, ''));
      }
    }
  } catch { /* no custom rules */ }

  return { hard, soft };
}
