export function chunkText(
  text: string,
  {
    maxChars = 1400,
    overlapChars = 150,
  }: { maxChars?: number; overlapChars?: number } = {},
) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + maxChars);
    const chunk = clean.slice(i, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= clean.length) break;
    i = Math.max(0, end - overlapChars);
  }

  return chunks;
}
