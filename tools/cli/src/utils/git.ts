import { execa } from 'execa';

interface GitDiffOptions {
  base: string;
  staged: boolean;
}

export async function getGitDiff({ base, staged }: GitDiffOptions): Promise<string> {
  try {
    if (staged) {
      const { stdout } = await execa('git', ['diff', '--cached']);
      return stdout;
    }
    const { stdout } = await execa('git', ['diff', `${base}...HEAD`]);
    return stdout;
  } catch {
    // Fallback: uncommitted working tree changes
    const { stdout } = await execa('git', ['diff', 'HEAD']);
    return stdout;
  }
}

export async function getCurrentBranch(): Promise<string> {
  const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return stdout.trim();
}

export async function getChangedFiles(base = 'main'): Promise<string[]> {
  const { stdout } = await execa('git', ['diff', '--name-only', `${base}...HEAD`]);
  return stdout.trim().split('\n').filter(Boolean);
}
