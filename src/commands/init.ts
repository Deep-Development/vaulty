import path from 'node:path';
import { getRepoRoot, isTracked, getHooksPath, setHooksPath } from '../utils/git.js';
import { readFileIfExists, ensureDir, writeFileAtomically } from '../utils/fs.js';
import { ensureVaultyGitignoreBlock } from '../utils/gitignore.js';
import { PRE_COMMIT_HOOK } from '../utils/hooks.js';

export async function init(opts: { yes?: boolean; hooks?: boolean } = {}) {
  const root = await getRepoRoot(process.cwd());
  if (!root) throw new Error('Not a git repository. Run "git init" first.');
  
  const trackedEnv: string[] = [];
  if (await isTracked('.env')) trackedEnv.push('.env');
  
  const gitignorePath = path.join(root, '.gitignore');
  const current = (await readFileIfExists(gitignorePath)) ?? '';
  const updated = ensureVaultyGitignoreBlock(current);
  if (updated !== current) {
    await writeFileAtomically(gitignorePath, updated);
  }
  
  if (opts.hooks !== false) {
    const hooksDir = path.join(root, '.vaulty', 'hooks');
    await ensureDir(hooksDir);
    const hookPath = path.join(hooksDir, 'pre-commit');
    await writeFileAtomically(hookPath, PRE_COMMIT_HOOK, 0o755);
    
    const currentHooksPath = await getHooksPath(root);
    if (!currentHooksPath) {
      await setHooksPath('.vaulty/hooks', root);
    } else if (currentHooksPath !== '.vaulty/hooks') {
      console.warn(`core.hooksPath already set to "${currentHooksPath}". Skipping hook installation.`);
    }
  }
  
  return { root, trackedEnv };
}