"use client";

import { supabase } from "@/services/supabase";
import React, { useEffect, useRef, useState } from "react";

const MAX_FREE_BYTES = 25 * 1024 * 1024;

type Source = {
  name: string;
  size: number;
  path: string;
};

const KnowledgeManager: React.FC<{
  userId: string;
  botId: string;
  plan?: "free" | "pro";
}> = ({ userId = "test-user", botId = "123", plan = "free" }) => {
  const [activeTab, setActiveTab] = useState<"upload" | "urls" | "text">(
    "upload",
  );

  const [files, setFiles] = useState<Source[]>([]);
  const [usedBytes, setUsedBytes] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const bucket = "knowledge-files";
  const basePath = `${userId}/${botId}`;

  /* ---------------------------------------------
     Load files from Supabase
  --------------------------------------------- */
  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      // List files in the specific path
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(basePath, {
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
          path: `${basePath}/${f.name}`,
        })) || [];

      setFiles(mapped);
      setUsedBytes(mapped.reduce((sum, f) => sum + f.size, 0));
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  }

  /* ---------------------------------------------
     Upload files
  --------------------------------------------- */
  async function uploadFiles(fileList: FileList) {
    for (const file of Array.from(fileList)) {
      if (plan === "free" && usedBytes + file.size > MAX_FREE_BYTES) {
        alert("Free plan limit reached (25MB)");
        return;
      }

      const { error } = await supabase.storage
        .from(bucket)
        .upload(`${basePath}/${file.name}`, file, {
          upsert: true,
        });

      if (error) {
        alert(error.message);
        return;
      }
    }
    loadFiles();
  }

  /* ---------------------------------------------
     Crawl URL and extract content
  --------------------------------------------- */
  async function crawlUrl() {
    if (!urlInput.trim()) {
      alert("Please enter a URL");
      return;
    }

    setIsCrawling(true);
    try {
      // Fetch the URL content
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const html = await response.text();

      // Extract text content from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Remove script and style tags
      const scripts = doc.querySelectorAll("script, style");
      scripts.forEach((s) => s.remove());

      // Get text content
      const textContent = doc.body.textContent || doc.body.innerText || "";
      const cleanText = textContent.replace(/\s+/g, " ").trim();

      // Create a text file from the content
      const fileName = `crawled_${new URL(urlInput).hostname}_${Date.now()}.txt`;
      const blob = new Blob([`URL: ${urlInput}\n\n${cleanText}`], {
        type: "text/plain",
      });
      const file = new File([blob], fileName, { type: "text/plain" });

      // Check size limit
      if (plan === "free" && usedBytes + file.size > MAX_FREE_BYTES) {
        alert("Free plan limit reached (25MB)");
        setIsCrawling(false);
        return;
      }

      // Upload to Supabase
      const { error } = await supabase.storage
        .from(bucket)
        .upload(`${basePath}/${fileName}`, file, {
          upsert: true,
        });

      if (error) {
        alert(error.message);
      } else {
        setUrlInput("");
        loadFiles();
        alert("URL content successfully crawled and saved!");
      }
    } catch (error) {
      console.error("Crawl error:", error);
      alert(error instanceof Error ? error.message : "Failed to crawl URL");
    } finally {
      setIsCrawling(false);
    }
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
    try {
      const fileName = `text_${Date.now()}.txt`;
      const blob = new Blob([textInput], { type: "text/plain" });
      const file = new File([blob], fileName, { type: "text/plain" });

      // Check size limit
      if (plan === "free" && usedBytes + file.size > MAX_FREE_BYTES) {
        alert("Free plan limit reached (25MB)");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.storage
        .from(bucket)
        .upload(`${basePath}/${fileName}`, file, {
          upsert: true,
        });

      if (error) {
        alert(error.message);
      } else {
        setTextInput("");
        loadFiles();
        alert("Text successfully saved!");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save text");
    } finally {
      setIsSaving(false);
    }
  }

  /* ---------------------------------------------
     Delete file
  --------------------------------------------- */
  async function deleteFile(path: string, size: number) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      alert(error.message);
      return;
    }
    setUsedBytes((b) => b - size);
    loadFiles();
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
      {/* Tabs */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="flex border-b">
          {(["upload", "urls", "text"] as const).map((tab) => (
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
                : tab === "urls"
                  ? "Crawl URLs"
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
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
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
                  PDFs, DOCX, TXT — Max 25MB (Free)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx"
                  className="hidden"
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

          {/* URLs */}
          {activeTab === "urls" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter URL to crawl
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://docs.yourproduct.com"
                  className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isCrawling}
                />
              </div>
              <button
                onClick={crawlUrl}
                disabled={isCrawling}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isCrawling ? "Crawling..." : "Start Crawling"}
              </button>
              <p className="text-sm text-slate-500">
                The content will be extracted and saved as a text file in your
                knowledge base.
              </p>
            </div>
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
                  disabled={isSaving}
                />
              </div>
              <button
                onClick={saveRawText}
                disabled={isSaving}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Ingest Text"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Index */}
      <div className="bg-white border rounded-xl">
        <div className="p-5 border-b font-bold">Knowledge Index</div>

        {files.length === 0 && (
          <p className="p-6 text-center text-slate-400">
            No documents uploaded
          </p>
        )}

        {files.map((f) => (
          <div
            key={f.path}
            className="p-4 flex justify-between items-center hover:bg-slate-50 transition"
          >
            <div>
              <p className="font-medium">{f.name}</p>
              <p className="text-xs text-slate-400">
                {(f.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => deleteFile(f.path, f.size)}
              className="text-red-500 hover:text-red-700 transition"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeManager;
