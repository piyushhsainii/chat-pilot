import { dynamicTool, jsonSchema } from "ai";
import { createAdminClient } from "@/lib/supabase/admin";

import { getConnectorsForBot } from "./connectors";
import { buildToolInstructionBlock } from "./toolInstructions";
import {
  checkGoogleCalendarAvailability,
  createGoogleCalendarEvent,
  resolveDateTimeToUtcIso,
} from "./googleCalendar";
import { checkRateLimit } from "@/lib/checkrateLimit";

type ToolBuildResult = {
  tools: Record<string, any>;
  toolInstruction: string;
};

function hasGoogleCalendar(conn: any) {
  return !!(conn?.google_refresh_token || conn?.google_access_token);
}

function hasCalendly(conn: any) {
  return !!conn?.calendly_api_token && !!conn?.calendly_scheduling_url;
}

export async function buildBotTools({
  botId,
  testMode,
  requestIp,
  onToolUsed,
}: {
  botId: string;
  testMode?: boolean;
  requestIp?: string;
  onToolUsed?: (evt: { tool: string; provider?: string; ok?: boolean }) => void;
}): Promise<ToolBuildResult> {
  const admin = createAdminClient();
  const { data: bot, error: botError } = await admin
    .from("bots")
    .select("id,workspace_id")
    .eq("id", botId)
    .maybeSingle();

  if (botError) throw botError;
  const workspaceId = (bot as any)?.workspace_id as string | undefined;
  if (!workspaceId) return { tools: {}, toolInstruction: "" };

  const connectors = await getConnectorsForBot({ botId, workspaceId });
  const toolInstruction = buildToolInstructionBlock(connectors);

  const google = connectors.find((c) => c.provider === "google_calendar" && hasGoogleCalendar(c));
  const calendly = connectors.find((c) => c.provider === "calendly" && hasCalendly(c));

  const tools: Record<string, any> = {};

  if (google || calendly) {
    tools.schedule_meeting = dynamicTool({
      description:
        "Schedule a meeting. Prefer Google Calendar if available; otherwise provide a Calendly scheduling link.",
      inputSchema: jsonSchema({
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string", description: "Event title" },
          startTime: {
            type: "string",
            description: "ISO date-time for start (e.g. 2026-01-31T15:00:00)",
          },
          endTime: {
            type: "string",
            description: "ISO date-time for end (e.g. 2026-01-31T15:30:00)",
          },
          timeZone: {
            type: "string",
            description: "IANA timezone like America/Los_Angeles",
          },
          attendeeEmail: { type: "string", description: "Optional attendee email" },
          description: { type: "string", description: "Optional description/notes" },
          location: { type: "string", description: "Optional meeting location" },
          provider: {
            type: "string",
            enum: ["google_calendar", "calendly"],
            description: "Optional provider override",
          },
          durationMinutes: {
            type: "number",
            description: "Optional duration in minutes (defaults to 30)",
          },
        },
        required: ["title"],
      }),
      execute: async (args: any) => {
        // Guardrail: prevent meeting-booking spam (separate from chat message rate limit).
        // Uses a synthetic key in the existing rate limit table.
        if (!testMode) {
          const allowed = await checkRateLimit(
            botId,
            `tool:schedule_meeting:${requestIp || "unknown"}`,
            2,
          );
          if (!allowed) {
            return {
              ok: false,
              error: "rate_limited",
              message: "Too many booking attempts. Please wait a moment and try again.",
            };
          }
        }

        const provider = String(args?.provider || "");
        const wantCalendly = provider === "calendly";

        if (!wantCalendly && google) {
          if (!args?.startTime) {
            onToolUsed?.({ tool: "schedule_meeting", provider: "google_calendar", ok: false });
            return {
              ok: false,
              error: "missing_time_range",
              message:
                "I need a startTime to create a calendar event. Ask the user for a date/time/timezone.",
            };
          }

          const durationMinutesRaw = args?.durationMinutes;
          const durationMinutes =
            typeof durationMinutesRaw === "number" && Number.isFinite(durationMinutesRaw)
              ? Math.max(5, Math.min(8 * 60, Math.round(durationMinutesRaw)))
              : 30;

          const startTime = String(args.startTime);
          const timeZone = args.timeZone ? String(args.timeZone) : undefined;
          const endTime = args?.endTime
            ? String(args.endTime)
            : (() => {
                const startUtc = resolveDateTimeToUtcIso(startTime, timeZone);
                const endUtc = new Date(new Date(startUtc).getTime() + durationMinutes * 60_000);
                return endUtc.toISOString();
              })();

          const availability = await checkGoogleCalendarAvailability({
            workspaceId,
            startTime,
            endTime,
            timeZone,
            testMode,
          });

          if (!availability.available) {
            onToolUsed?.({ tool: "schedule_meeting", provider: "google_calendar", ok: false });
            return {
              ok: false,
              error: "time_slot_unavailable",
              message:
                "That time slot is not available on the connected Google Calendar. Ask the user for an alternate time.",
              provider: "google_calendar",
              busy: availability.busy,
            };
          }

          const event = await createGoogleCalendarEvent({
            workspaceId,
            title: String(args.title),
            description: args.description ? String(args.description) : undefined,
            startTime,
            endTime,
            timeZone,
            attendeeEmail: args.attendeeEmail ? String(args.attendeeEmail) : undefined,
            location: args.location ? String(args.location) : undefined,
            createMeetLink: true,
            testMode,
          });

          onToolUsed?.({ tool: "schedule_meeting", provider: "google_calendar", ok: true });

          return {
            provider: "google_calendar",
            startTime,
            endTime,
            ...event,
          };
        }

        if (calendly) {
          onToolUsed?.({ tool: "schedule_meeting", provider: "calendly", ok: true });
          return {
            ok: true,
            provider: "calendly",
            schedulingUrl: (calendly as any)?.calendly_scheduling_url ?? null,
          };
        }

        onToolUsed?.({ tool: "schedule_meeting", provider: wantCalendly ? "calendly" : undefined, ok: false });
        return { ok: false, error: "no_scheduling_connector" };
      },
    });
  }

  // Future: Stripe + other tools only when connected.

  return { tools, toolInstruction };
}
