import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function contentTypeForPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".map") return "application/json; charset=utf-8";
  if (ext === ".d.ts") return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

function safeResolveDistPath(parts: string[]) {
  const distRoot = path.join(process.cwd(), "node_modules", "@paper-design", "shaders", "dist");
  const requested = path.join(distRoot, ...parts);
  const normalizedRoot = path.normalize(distRoot + path.sep);
  const normalizedRequested = path.normalize(requested);
  if (!normalizedRequested.startsWith(normalizedRoot)) return null;
  return normalizedRequested;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ file: string[] }> }) {
  const { file } = await ctx.params;

  const parts = Array.isArray(file) && file.length ? file : ["index.js"];
  const resolved = safeResolveDistPath(parts);
  if (!resolved) return new NextResponse("Not found", { status: 404 });

  try {
    const buf = fs.readFileSync(resolved);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentTypeForPath(resolved),
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
