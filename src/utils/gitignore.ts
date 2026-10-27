export const VAULTY_MARKER_START = "# >>> vaulty >>>";
export const VAULTY_MARKER_END = "# <<< vaulty <<<";

const ENTRIES = [
    '.env',
    '.env.*',
    '.env.local',
    '.env.*.local',
    '!.env.example',
    '!.env.*.example',
    '!.env.local.example',
    '!.env.*.local.example',
];

export function ensureVaultyGitignoreBlock(current: string): string {
  const block = `${VAULTY_MARKER_START}\n${ENTRIES.join('\n')}\n${VAULTY_MARKER_END}\n`;
  const start = current.indexOf(VAULTY_MARKER_START);
  const end = current.indexOf(VAULTY_MARKER_END);

  if (start !== -1 && end !== -1 && end > start) {
    const rest = current.slice(end + VAULTY_MARKER_END.length).replace(/^\n+/, '\n');
    return current.slice(0, start).replace(/\n+$/, '\n') + block + rest.replace(/^\n*/, rest.startsWith('\n') ? '' : '');
  }

  if (!current.trim()) {
    return block;
  }

  if (!current.endsWith('\n')) {
    return current + '\n\n' + block;
  }

  return current + '\n' + block;
}