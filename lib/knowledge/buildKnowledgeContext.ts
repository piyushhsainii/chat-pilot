export type KnowledgeSourceForContext = {
  name: string;
  type?: string | null;
  status?: string | null;
  doc_url?: string[] | null;
};

type BuildKnowledgeContextOptions = {
  maxTotalChars?: number;
  maxPerDocChars?: number;
  fetchTimeoutMs?: number;
};

function isLikelyTextUrl(url: string) {
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".json") ||
    lower.includes("text_")
  );
}

export async function buildKnowledgeContext(
  sources: KnowledgeSourceForContext[],
  {
    maxTotalChars = 24000,
    maxPerDocChars = 8000,
    fetchTimeoutMs = 4500,
  }: BuildKnowledgeContextOptions = {},
) {
  const urls: { name: string; url: string; type?: string | null }[] = [];
  for (const s of sources) {
    for (const u of s.doc_url ?? []) {
      if (!u) continue;
      urls.push({ name: s.name, url: u, type: s.type ?? null });
    }
  }

  const urlList = urls
    .map((u) => `- ${u.name}${u.type ? ` (${u.type})` : ""}: ${u.url}`)
    .join("\n");

  let used = 0;
  const extracts: string[] = [];
  let fetched = 0;
  let failed = 0;

  for (const u of urls) {
    if (used >= maxTotalChars) break;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);

    try {
      const res = await fetch(u.url, { signal: controller.signal });
      if (!res.ok) {
        failed += 1;
        continue;
      }

      const contentType = res.headers.get("content-type") || "";
      const allow =
        contentType.includes("text/") ||
        contentType.includes("application/json") ||
        isLikelyTextUrl(u.url);
      if (!allow) {
        // PDFs/DOCX/etc are not parsed here
        continue;
      }

      const text = await res.text();
      const clipped = text.slice(0, maxPerDocChars);
      if (!clipped.trim()) continue;

      const header = `[Source: ${u.name}]`;
      const chunk = `${header}\n${clipped}`;
      const remaining = Math.max(0, maxTotalChars - used);
      const finalChunk = chunk.slice(0, remaining);

      extracts.push(finalChunk);
      used += finalChunk.length;
      fetched += 1;
    } catch {
      failed += 1;
    } finally {
      clearTimeout(timeout);
    }
  }

  const contextText = [
    "Knowledge sources (URLs):",
    urlList || "- (none)",
    "",
    "Knowledge extracts:",
    extracts.length ? extracts.join("\n\n---\n\n") : "(no readable extracts)",
  ].join("\n");

  return {
    contextText,
    fetched,
    failed,
    totalUrls: urls.length,
  };
}
