import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

export async function getRepoRoot(cwd = process.cwd()): Promise<string | null> {
  try {
    const { stdout } = await run('git', ['rev-parse', '--show-toplevel'], { cwd });
    return stdout.trim() || null;
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === 'ENOENT') throw new Error('git is not installed or not on PATH');
    return null;
  }
}

export async function isGitRepo(cwd?: string): Promise<boolean> {
  return (await getRepoRoot(cwd)) !== null;
}