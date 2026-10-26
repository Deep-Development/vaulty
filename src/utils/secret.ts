import { randomBytes } from 'node:crypto';

export function genJwt(length: string): string {
  const bytes = Number(length);

  if (!Number.isInteger(bytes)) throw new Error('Length must be an integer');
  if (bytes < 32) throw new Error('Length must be at least 32 bytes');
  if (bytes > 1024) throw new Error('Length must not exceed 1024 bytes');

  return randomBytes(bytes).toString('hex');
}