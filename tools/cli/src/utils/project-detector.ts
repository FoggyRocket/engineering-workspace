import { readFile, access } from 'fs/promises';
import { join } from 'path';

export type ProjectType = 'nextjs' | 'react' | 'node-api' | 'generic';

async function fileExists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

export async function detectProjectType(): Promise<ProjectType> {
  const cwd = process.cwd();

  // Check package.json for clues
  try {
    const pkgRaw = await readFile(join(cwd, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw) as Record<string, unknown>;
    const deps = {
      ...(pkg['dependencies'] as Record<string, string> ?? {}),
      ...(pkg['devDependencies'] as Record<string, string> ?? {}),
    };

    if ('next' in deps) return 'nextjs';
    if ('react' in deps) return 'react';
    if ('express' in deps || 'fastify' in deps || 'hono' in deps) return 'node-api';
  } catch { /* no package.json */ }

  if (await fileExists(join(cwd, 'next.config.js')) || await fileExists(join(cwd, 'next.config.ts'))) {
    return 'nextjs';
  }

  return 'generic';
}
