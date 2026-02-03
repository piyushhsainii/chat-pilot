import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chunkText } from "@/lib/knowledge/chunkText";
import { formatVector, getEmbedding } from "@/lib/openai/embeddings";

export const runtime = "nodejs";

type Payload = {
  botId: string;
  sourceId: string;
  sourceName: string;
  type: "pdf" | "text";
  publicUrl: string;
};

async function fetchToText(type: Payload["type"], publicUrl: string) {
  const res = await fetch(publicUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch source (${res.status})`);
  }

  if (type === "text") {
    return await res.text();
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const mod = (await import("pdf-parse")) as any;
  const pdfParse = (mod?.default ?? mod) as any;
  const parsed = await pdfParse(buf);
  return String(parsed?.text ?? "");
}

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as Payload | null;
  if (!payload?.botId || !payload?.sourceId || !payload?.publicUrl) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: bot } = await admin
    .from("bots")
    .select("id, owner_id")
    .eq("id", payload.botId)
    .single();

  if (!bot || bot.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await admin
      .from("knowledge_sources" as any)
      .update({ status: "processing" } as any)
      .eq("id", payload.sourceId);

    const text = await fetchToText(payload.type, payload.publicUrl);
    const chunks = chunkText(text);

    await admin.from("documents" as any).delete().eq("source_id", payload.sourceId);

    for (let i = 0; i < chunks.length; i += 1) {
      const content = chunks[i];
      const embedding = await getEmbedding(content);

      const { error: insertError } = await admin.from("documents" as any).insert({
        bot_id: payload.botId,
        source_id: payload.sourceId,
        content,
        embedding: formatVector(embedding),
        metadata: {
          sourceName: payload.sourceName,
          publicUrl: payload.publicUrl,
          chunkIndex: i,
          type: payload.type,
        },
      } as any);

      if (insertError) throw insertError;
    }

    const now = new Date().toISOString();
    await admin
      .from("knowledge_sources" as any)
      .update({ status: "indexed", last_indexed: now } as any)
      .eq("id", payload.sourceId);

    return NextResponse.json({ ok: true, chunks: chunks.length });
  } catch (e: any) {
    await admin
      .from("knowledge_sources" as any)
      .update({ status: "failed" } as any)
      .eq("id", payload.sourceId);

    return NextResponse.json(
      { error: e?.message ?? "Ingestion failed" },
      { status: 500 },
    );
  }
}
