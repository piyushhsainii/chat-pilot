import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const widgetPath = path.join(process.cwd(), "public/widget.js");
  const widgetCode = fs.readFileSync(widgetPath, "utf-8");

  return new NextResponse(widgetCode, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
