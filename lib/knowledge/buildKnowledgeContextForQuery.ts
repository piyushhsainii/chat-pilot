import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

import { buildKnowledgeContext, type KnowledgeSourceForContext } from "./buildKnowledgeContext";
import { formatVector, getEmbedding } from "@/lib/openai/embeddings";

type MatchDocumentsRow = Database["public"]["Functions"]["match_documents"]["Returns"][number];

function buildUrlList(sources: KnowledgeSourceForContext[]) {
  const urls: { name: string; url: string; type?: string | null }[] = [];
  for (const s of sources) {
    for (const u of s.doc_url ?? []) {
      if (!u) continue;
      urls.push({ name: s.name, url: u, type: s.type ?? null });
    }
  }

  return urls
    .map((u) => `- ${u.name}${u.type ? ` (${u.type})` : ""}: ${u.url}`)
    .join("\n");
}

function formatSnippets(rows: MatchDocumentsRow[], maxTotalChars: number) {
  let used = 0;
  const out: string[] = [];

  for (const r of rows) {
    if (used >= maxTotalChars) break;

    const md = (r.metadata ?? {}) as any;
    const sourceName = typeof md?.sourceName === "string" ? md.sourceName : undefined;
    const header = `[Match: ${sourceName ?? r.id}]`;
    const chunk = `${header}\n${String(r.content ?? "")}`;
    const remaining = Math.max(0, maxTotalChars - used);
    const finalChunk = chunk.slice(0, remaining);

    if (!finalChunk.trim()) continue;
    out.push(finalChunk);
    used += finalChunk.length;
  }

  return out;
}

export async function buildKnowledgeContextForQuery(
  supabase: SupabaseClient<Database>,
  {
    botId,
    query,
    sources,
    maxTotalChars = 24000,
    matchCount = 8,
    matchThreshold = 0.62,
  }: {
    botId: string;
    query: string;
    sources: KnowledgeSourceForContext[];
    maxTotalChars?: number;
    matchCount?: number;
    matchThreshold?: number;
  },
) {
  const urlList = buildUrlList(sources);

  let snippets: string[] = [];
  let ragFailed = false;

  if (process.env.OPENAI_API_KEY) {
    try {
      const queryEmbedding = await getEmbedding(query);
      const { data, error } = await supabase.rpc("match_documents", {
        p_bot_id: botId,
        query_embedding: formatVector(queryEmbedding),
        match_count: matchCount,
        match_threshold: matchThreshold,
      });

      if (error) throw error;
      snippets = formatSnippets(((data as any[]) ?? []) as MatchDocumentsRow[], maxTotalChars);
    } catch {
      ragFailed = true;
    }
  }

  // Fallback to the URL-based (text-only) extraction if we have no vectors yet.
  if (!snippets.length) {
    const legacy = await buildKnowledgeContext(sources, {
      maxTotalChars,
    });
    return legacy;
  }

  const contextText = [
    "Knowledge sources (URLs):",
    urlList || "- (none)",
    "",
    ragFailed
      ? "Relevant knowledge snippets (vector search; partial failure):"
      : "Relevant knowledge snippets (vector search):",
    snippets.length ? snippets.join("\n\n---\n\n") : "(none)",
  ].join("\n");

  return {
    contextText,
    fetched: snippets.length,
    failed: ragFailed ? 1 : 0,
    totalUrls: (sources ?? []).reduce((sum, s) => sum + (s.doc_url?.length ?? 0), 0),
  };
}
