"use client";

import { supabase } from "@/services/supabase";
import { useDashboard } from "@/provider/DashboardContext";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAX_FREE_BYTES = 25 * 1024 * 1024;

type Source = {
  name: string;
  size: number;
  path: string;
};

type KnowledgeSourceRow = {
  id: string;
  bot_id: string | null;
  name: string;
  type: "pdf" | "url" | "text" | null;
  status: "processing" | "indexed" | "failed" | null;
  last_indexed: string | null;
  created_at: string | null;
  doc_url: string[] | null;
};

const KnowledgeManager: React.FC<{
  plan?: "free" | "pro";
}> = ({ plan = "free" }) => {
  const { user, bots } = useDashboard();

  const userId = user?.id ?? "test-user";

  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const selectedBot = useMemo(
    () => bots?.find((b: any) => b.id === selectedBotId) ?? null,
    [bots, selectedBotId],
  );

  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");

  const [files, setFiles] = useState<Source[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSourceRow[]>(
    [],
  );
  const [usedBytes, setUsedBytes] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const bucket = "knowledge-files";
  const basePath = selectedBotId ? `${userId}/${selectedBotId}` : null;

  const loadKnowledgeSources = useCallback(async (botId: string) => {
    try {
      const { data, error } = await supabase
        .from("knowledge_sources" as any)
        .select(
          "id, bot_id, name, type, status, last_indexed, created_at, doc_url",
        )
        .eq("bot_id", botId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading knowledge sources:", error);
        return;
      }

      setKnowledgeSources(((data as unknown) as KnowledgeSourceRow[]) ?? []);
    } catch (err) {
      console.error("Failed to load knowledge sources:", err);
    }
  }, []);

  const getSourceTypeFromName = useCallback((name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf" as const;
    return "text" as const;
  }, []);

  const upsertKnowledgeSource = useCallback(
    async ({
      botId,
      name,
      type,
      publicUrl,
    }: {
      botId: string;
      name: string;
      type: "pdf" | "text";
      publicUrl: string;
    }) => {
      const { data: existing, error: existingError } = await supabase
        .from("knowledge_sources" as any)
        .select("id")
        .eq("bot_id", botId)
        .eq("name", name)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingError) {
        console.error(
          "Error checking existing knowledge source:",
          existingError,
        );
        throw existingError;
      }

      const existingId = (existing as any[])?.[0]?.id as string | undefined;
      if (existingId) {
        const { data: updated, error: updateError } = await supabase
          .from("knowledge_sources" as any)
          .update({ doc_url: [publicUrl], status: "processing", type } as any)
          .select("id")
          .eq("id", existingId);
        if (updateError) throw updateError;
        return ((updated as any[])?.[0]?.id as string) ?? existingId;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("knowledge_sources" as any)
        .insert({ bot_id: botId, name, type, doc_url: [publicUrl] } as any)
        .select("id")
        .single();

      if (insertError) throw insertError;
      return (inserted as any)?.id as string;
    },
    [],
  );

  const ingestKnowledgeSource = useCallback(
    async ({
      botId,
      sourceId,
      sourceName,
      type,
      publicUrl,
    }: {
      botId: string;
      sourceId: string;
      sourceName: string;
      type: "pdf" | "text";
      publicUrl: string;
    }) => {
      const res = await fetch("/api/knowledge/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          sourceId,
          sourceName,
          type,
          publicUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to index document");
      }
    },
    [],
  );

  const loadFiles = useCallback(
    async (path: string) => {
      try {
        // List files in the specific path
        const { data, error } = await supabase.storage.from(bucket).list(path, {
          limit: 100,
          offset: 0,
        });

        if (error) {
          console.error("Error loading files:", error);
          return;
        }

        const mapped =
          data?.map((f) => ({
            name: f.name,
            size: f.metadata?.size || 0,
            path: `${path}/${f.name}`,
          })) || [];

        setFiles(mapped);
        setUsedBytes(mapped.reduce((sum, f) => sum + f.size, 0));
      } catch (err) {
        console.error("Failed to load files:", err);
      }
    },
    [bucket],
  );

  /* ---------------------------------------------
     Load files from Supabase
  --------------------------------------------- */
  useEffect(() => {
    if (bots && bots.length > 0 && !selectedBotId) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId]);

  useEffect(() => {
    if (!basePath) return;
    loadFiles(basePath);
  }, [basePath, loadFiles]);

  useEffect(() => {
    if (!selectedBotId) return;
    loadKnowledgeSources(selectedBotId);
  }, [selectedBotId, loadKnowledgeSources]);

  /* ---------------------------------------------
     Upload files
  --------------------------------------------- */
  async function uploadFiles(fileList: FileList) {
    if (!basePath) return;
    if (!selectedBotId) return;
    setIsIndexing(true);
    for (const file of Array.from(fileList)) {
      if (plan === "free" && usedBytes + file.size > MAX_FREE_BYTES) {
        alert("Free plan limit reached (25MB)");
        setIsIndexing(false);
        return;
      }

      const storagePath = `${basePath}/${file.name}`;

      const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
        upsert: true,
      });

      if (error) {
        alert(error.message);
        setIsIndexing(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);
      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) {
        alert("Failed to generate public URL for uploaded file");
        setIsIndexing(false);
        return;
      }

      try {
        const type = getSourceTypeFromName(file.name);
        const sourceId = await upsertKnowledgeSource({
          botId: selectedBotId,
          name: file.name,
          type,
          publicUrl,
        });

        if (sourceId) {
          await ingestKnowledgeSource({
            botId: selectedBotId,
            sourceId,
            sourceName: file.name,
            type,
            publicUrl,
          });
        }
      } catch (e: any) {
        console.error(e);
        alert(e?.message ?? "Failed to save knowledge source");
        setIsIndexing(false);
        return;
      }
    }
    loadFiles(basePath);
    loadKnowledgeSources(selectedBotId);
    setIsIndexing(false);
  }

  /* ---------------------------------------------
     Save raw text
  --------------------------------------------- */
  async function saveRawText() {
    if (!textInput.trim()) {
      alert("Please enter some text");
      return;
    }

    setIsSaving(true);
    setIsIndexing(true);
    try {
      if (!basePath) return;
      if (!selectedBotId) return;
      const fileName = `text_${Date.now()}.txt`;
      const blob = new Blob([textInput], { type: "text/plain" });
      const file = new File([blob], fileName, { type: "text/plain" });

      // Check size limit
      if (plan === "free" && usedBytes + file.size > MAX_FREE_BYTES) {
        alert("Free plan limit reached (25MB)");
        setIsSaving(false);
        setIsIndexing(false);
        return;
      }

      const storagePath = `${basePath}/${fileName}`;
      const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
        upsert: true,
      });

      if (error) {
        alert(error.message);
      } else {
        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(storagePath);
        const publicUrl = publicData?.publicUrl;
        if (!publicUrl) {
          alert("Failed to generate public URL for saved text");
          setIsIndexing(false);
          return;
        }

        const sourceId = await upsertKnowledgeSource({
          botId: selectedBotId,
          name: fileName,
          type: "text",
          publicUrl,
        });

        if (sourceId) {
          await ingestKnowledgeSource({
            botId: selectedBotId,
            sourceId,
            sourceName: fileName,
            type: "text",
            publicUrl,
          });
        }

        setTextInput("");
        loadFiles(basePath);
        loadKnowledgeSources(selectedBotId);
        alert("Text successfully saved!");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error?.message ?? "Failed to save text");
    } finally {
      setIsSaving(false);
      setIsIndexing(false);
    }
  }

  /* ---------------------------------------------
     Delete file
  --------------------------------------------- */
  async function deleteFile(path: string, size: number) {
    if (!selectedBotId) return;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      alert(error.message);
      return;
    }

    const name = path.split("/").pop() ?? path;
    const { error: deleteRowError } = await supabase
      .from("knowledge_sources" as any)
      .delete()
      .eq("bot_id", selectedBotId)
      .eq("name", name);
    if (deleteRowError) {
      console.error("Failed to delete knowledge source row:", deleteRowError);
    }

    setUsedBytes((b) => b - size);
    if (basePath) loadFiles(basePath);
    loadKnowledgeSources(selectedBotId);
  }

  /* ---------------------------------------------
     Drag handlers
  --------------------------------------------- */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-6">
      {/* Bot picker */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Select Bot
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {selectedBot?.name ?? "Choose a bot to manage knowledge"}
            </p>
          </div>
          <div className="text-xs text-slate-500">Storage is per bot</div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(bots ?? []).map((b: any) => {
            const active = b.id === selectedBotId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBotId(b.id)}
                className={`shrink-0 px-4 py-2 rounded-full border text-xs font-semibold transition whitespace-nowrap ${
                  active
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                title={b.name}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="flex border-b">
          {(["upload", "text"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold transition ${
                activeTab === tab
                  ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab === "upload"
                ? "Upload Files"
                : "Raw Text"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Upload */}
          {activeTab === "upload" && (
            <>
               <div
                 onClick={() => {
                   if (isIndexing) return;
                   fileInputRef.current?.click();
                 }}
                 onDragOver={(e) => {
                   e.preventDefault();
                   if (isIndexing) return;
                   setDragging(true);
                 }}
                 onDragLeave={() => setDragging(false)}
                 onDrop={handleDrop}
                 className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition
                  ${
                    dragging
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
              >
                <div className="text-4xl mb-4">📄</div>
                <h4 className="font-bold text-lg">Click or drag files here</h4>
                 <p className="text-slate-500 mt-1">
                   PDFs, TXT — Max 25MB (Free)
                 </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt"
                    className="hidden"
                    disabled={isIndexing}
                    onChange={(e) =>
                      e.target.files && uploadFiles(e.target.files)
                    }
                  />
                </div>

              <p className="mt-4 text-sm text-slate-600">
                Storage used:{" "}
                <strong>{(usedBytes / (1024 * 1024)).toFixed(2)} MB</strong> /
                25 MB
              </p>
            </>
          )}

          {/* Raw Text */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paste your knowledge
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste knowledge here..."
                  className="w-full h-40 border border-slate-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSaving || isIndexing}
                />
              </div>
              <button
                onClick={saveRawText}
                disabled={isSaving || isIndexing}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSaving || isIndexing ? "Indexing..." : "Ingest Text"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Index */}
      <div className="bg-white border rounded-xl">
        <div className="p-5 border-b font-bold">
          Knowledge Index
          {selectedBot?.name ? (
            <span className="ml-2 text-xs text-slate-500 font-semibold">
              ({selectedBot.name})
            </span>
          ) : null}
        </div>

        {files.length === 0 && (
          <p className="p-6 text-center text-slate-400">
            No documents uploaded
          </p>
        )}

        {files.map((f) => {
          const row = knowledgeSources.find((s) => s.name === f.name);
          const status = row?.status ?? "processing";
          const type = row?.type ?? getSourceTypeFromName(f.name);

          const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(f.path);
          const openUrl = row?.doc_url?.[0] ?? publicData?.publicUrl ?? null;

          return (
            <div
              key={f.path}
              className="p-4 flex justify-between items-center hover:bg-slate-50 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{f.name}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${
                      status === "indexed"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : status === "failed"
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    {status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 font-semibold uppercase tracking-wide bg-white">
                    {type}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-xs text-slate-400">
                    {(f.size / 1024).toFixed(1)} KB
                  </p>
                  {openUrl ? (
                    <a
                      href={openUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Open
                    </a>
                  ) : null}
                </div>
              </div>
              <button
                onClick={() => deleteFile(f.path, f.size)}
                className="text-red-500 hover:text-red-700 transition"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KnowledgeManager;
