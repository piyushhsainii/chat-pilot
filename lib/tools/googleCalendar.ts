import { createAdminClient } from "@/lib/supabase/admin";

type RefreshResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

type GoogleFreeBusyResponse = {
  calendars?: {
    [calendarId: string]: {
      busy?: Array<{ start?: string; end?: string }>;
      errors?: any[];
    };
  };
};

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function hasOffsetOrZ(input: string) {
  return /([zZ]|[+-]\d\d:\d\d)$/.test(input.trim());
}

function parseLocalDateTime(input: string) {
  const m = input
    .trim()
    .match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/,
    );
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] ?? 0);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  ) {
    return null;
  }
  return { year, month, day, hour, minute, second };
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const second = Number(get("second"));

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  ) {
    throw new Error("timezone_format_failed");
  }

  return { year, month, day, hour, minute, second };
}

function zonedLocalTimeToUtcDate(local: ReturnType<typeof parseLocalDateTime>, timeZone: string) {
  if (!local) throw new Error("invalid_local_datetime");

  const desiredUtcMs = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second,
  );

  // Initial guess: treat local time as if it were UTC, then shift to match.
  let utc = new Date(desiredUtcMs);

  for (let i = 0; i < 2; i++) {
    const got = getDatePartsInTimeZone(utc, timeZone);
    const gotUtcMs = Date.UTC(
      got.year,
      got.month - 1,
      got.day,
      got.hour,
      got.minute,
      got.second,
    );

    const diff = desiredUtcMs - gotUtcMs;
    if (!diff) break;
    utc = new Date(utc.getTime() + diff);
  }

  if (Number.isNaN(utc.getTime())) throw new Error("invalid_datetime");
  return utc;
}

export function resolveDateTimeToUtcIso(dateTime: string, timeZone?: string) {
  const raw = String(dateTime || "").trim();
  if (!raw) throw new Error("missing_datetime");

  if (hasOffsetOrZ(raw)) {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) throw new Error("invalid_datetime");
    return d.toISOString();
  }

  if (!timeZone) {
    throw new Error("missing_timezone");
  }

  const local = parseLocalDateTime(raw);
  const utc = zonedLocalTimeToUtcDate(local, timeZone);
  return utc.toISOString();
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = requiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_OAUTH_CLIENT_SECRET");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = (await res.json().catch(() => ({}))) as RefreshResponse & {
    error?: string;
  };

  if (!res.ok || !json.access_token) {
    throw new Error(json.error || `google_refresh_failed_${res.status}`);
  }

  const expiresAt = new Date(Date.now() + (json.expires_in ?? 3600) * 1000).toISOString();
  return { accessToken: json.access_token, expiresAt };
}

async function getGoogleAccessToken(workspaceId: string) {
  const admin = createAdminClient();
  const { data: conn, error } = await admin
    .from("workspace_connectors")
    .select(
      "google_access_token,google_access_token_expires_at,google_refresh_token",
    )
    .eq("workspace_id", workspaceId)
    .eq("provider", "google_calendar")
    .maybeSingle();

  if (error) throw error;
  const refreshToken = (conn as any)?.google_refresh_token as string | null;
  if (!refreshToken) throw new Error("google_calendar_not_connected");

  let accessToken = (conn as any)?.google_access_token as string | null;
  const expiresAtRaw = (conn as any)?.google_access_token_expires_at as string | null;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).getTime() : 0;

  if (!accessToken || !expiresAt || expiresAt - Date.now() < 60_000) {
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.accessToken;

    await admin
      .from("workspace_connectors" as any)
      .update({
        google_access_token: refreshed.accessToken,
        google_access_token_expires_at: refreshed.expiresAt,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("workspace_id", workspaceId)
      .eq("provider", "google_calendar");
  }

  if (!accessToken) throw new Error("google_access_token_missing");
  return accessToken;
}

export async function checkGoogleCalendarAvailability({
  workspaceId,
  startTime,
  endTime,
  timeZone,
  testMode,
}: {
  workspaceId: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  testMode?: boolean;
}) {
  const startUtc = resolveDateTimeToUtcIso(startTime, timeZone);
  const endUtc = resolveDateTimeToUtcIso(endTime, timeZone);

  if (testMode) {
    return {
      ok: true,
      simulated: true,
      available: true,
      startTimeUtc: startUtc,
      endTimeUtc: endUtc,
      busy: [],
    };
  }

  const accessToken = await getGoogleAccessToken(workspaceId);
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: startUtc,
      timeMax: endUtc,
      items: [{ id: "primary" }],
    }),
  });

  const json = (await res.json().catch(() => ({}))) as GoogleFreeBusyResponse & any;
  if (!res.ok) {
    throw new Error(json?.error?.message || `google_calendar_freebusy_failed_${res.status}`);
  }

  const busy = (json as any)?.calendars?.primary?.busy ?? [];
  return {
    ok: true,
    available: Array.isArray(busy) ? busy.length === 0 : true,
    startTimeUtc: startUtc,
    endTimeUtc: endUtc,
    busy: Array.isArray(busy) ? busy : [],
  };
}

export async function createGoogleCalendarEvent({
  workspaceId,
  title,
  description,
  startTime,
  endTime,
  timeZone,
  attendeeEmail,
  location,
  createMeetLink,
  testMode,
}: {
  workspaceId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  attendeeEmail?: string;
  location?: string;
  createMeetLink?: boolean;
  testMode?: boolean;
}) {
  if (testMode) {
    return {
      ok: true,
      simulated: true,
      message: `Test mode: would create calendar event "${title}" (${startTime} - ${endTime}${timeZone ? ` ${timeZone}` : ""}).`,
      htmlLink: null,
      meetLink: null,
    };
  }

  const accessToken = await getGoogleAccessToken(workspaceId);

  const payload: any = {
    summary: title,
    description: description || undefined,
    location: location || undefined,
    start: { dateTime: startTime, timeZone: timeZone || "UTC" },
    end: { dateTime: endTime, timeZone: timeZone || "UTC" },
  };

  if (attendeeEmail) {
    payload.attendees = [{ email: attendeeEmail }];
  }

  if (createMeetLink) {
    payload.conferenceData = {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  if (createMeetLink) {
    url.searchParams.set("conferenceDataVersion", "1");
  }
  if (attendeeEmail) {
    url.searchParams.set("sendUpdates", "all");
  }

  const res = await fetch(
    url.toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const json = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    throw new Error(json?.error?.message || `google_calendar_insert_failed_${res.status}`);
  }

  return {
    ok: true,
    id: json?.id ?? null,
    htmlLink: json?.htmlLink ?? null,
    meetLink:
      json?.hangoutLink ??
      json?.conferenceData?.entryPoints?.find((ep: any) => ep?.entryPointType === "video")
        ?.uri ??
      null,
  };
}
