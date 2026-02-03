import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { requiredEnv } from "../../_lib";

export const runtime = "nodejs";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export async function GET() {
  const clientId = requiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const redirectUri = requiredEnv("GOOGLE_OAUTH_REDIRECT_URI");

  const state = crypto.randomUUID();

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  const cookieStore = await cookies();
  cookieStore.set("gc_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(url.toString());
}
