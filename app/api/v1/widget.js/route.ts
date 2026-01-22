import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const widgetPath = path.join(process.cwd(), "public/widget.js");
  const widgetCode = fs.readFileSync(widgetPath, "utf-8");

  return new NextResponse(widgetCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
