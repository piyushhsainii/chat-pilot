import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  // Simple, pragmatic check.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; name?: string | null; company?: string | null }
    | null;

  const email = String(body?.email || "").trim().toLowerCase();
  const name = typeof body?.name === "string" ? body?.name.trim().slice(0, 200) : null;
  const company =
    typeof body?.company === "string" ? body?.company.trim().slice(0, 200) : null;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("waitlist_signups" as any)
    .upsert(
      {
        email,
        name,
        company,
        created_at: new Date().toISOString(),
      } as any,
      { onConflict: "email" },
    );

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
