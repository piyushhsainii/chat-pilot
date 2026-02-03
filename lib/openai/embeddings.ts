type EmbeddingResponse = {
  data?: Array<{ embedding?: number[] }>;
};

export function formatVector(v: number[]) {
  // PostgREST expects pgvector as a string like: [0.1,0.2,...]
  return `[${v.join(",")}]`;
}

export async function getEmbedding(input: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Embedding request failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as EmbeddingResponse;
  const embedding = json.data?.[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("Invalid embedding response");
  }

  return embedding;
}
