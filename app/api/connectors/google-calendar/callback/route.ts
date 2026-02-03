import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requireAuthedSession, requiredEnv } from "../../_lib";

export const runtime = "nodejs";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
  id_token?: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("gc_oauth_state")?.value;
  cookieStore.set("gc_oauth_state", "", { path: "/", maxAge: 0 });

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/connectors?google=missing_code", req.url),
    );
  }
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/dashboard/connectors?google=bad_state", req.url));
  }

  const { supabase, user, workspaceId } = await requireAuthedSession();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (!workspaceId) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  const clientId = requiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_OAUTH_CLIENT_SECRET");
  const redirectUri = requiredEnv("GOOGLE_OAUTH_REDIRECT_URI");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenJson = (await tokenRes.json()) as TokenResponse & { error?: string };
  if (!tokenRes.ok) {
    const reason = tokenJson?.error || "token_exchange_failed";
    return NextResponse.redirect(
      new URL(`/dashboard/connectors?google=${encodeURIComponent(reason)}`, req.url),
    );
  }

  const expiresAt = new Date(Date.now() + tokenJson.expires_in * 1000).toISOString();
  const scopes = tokenJson.scope ? tokenJson.scope.split(" ").filter(Boolean) : [];

  // Preserve refresh token if Google doesn't return it (common on re-consent).
  const { data: existing } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("workspace_connectors" as any)
    .select("google_refresh_token, bot_ids, tool_instructions")
    .eq("workspace_id", workspaceId)
    .eq("provider", "google_calendar")
    .maybeSingle();

  const refreshToken = tokenJson.refresh_token || (existing as any)?.google_refresh_token || null;
  const existingBotIds = (existing as any)?.bot_ids ?? null;
  const existingToolInstructions = (existing as any)?.tool_instructions ?? null;

  const { error: upsertError } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("workspace_connectors" as any)
    .upsert(
      {
        workspace_id: workspaceId,
        provider: "google_calendar",
        google_access_token: tokenJson.access_token,
        google_access_token_expires_at: expiresAt,
        google_refresh_token: refreshToken,
        google_scopes: scopes,
        bot_ids: existingBotIds,
        tool_instructions: existingToolInstructions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id,provider" },
    );

  if (upsertError) {
    return NextResponse.redirect(
      new URL("/dashboard/connectors?google=db_error", req.url),
    );
  }

  return NextResponse.redirect(new URL("/dashboard/connectors?google=connected", req.url));
}
