import type { WorkspaceConnector } from "./connectors";

const DEFAULTS: Record<string, string> = {
  google_calendar:
    "Use Google Calendar when the user asks to schedule/book/reschedule/cancel a meeting or create a calendar event. Default calls to 30 minutes unless the user specifies otherwise. Before booking, say you are checking time slot availability; if available, proceed to book and confirm with the meeting link (Google Meet link if present, otherwise the event link). Ask for missing details (date/time/timezone/email).",
  calendly:
    "Use Calendly when the user wants to book a meeting and a scheduling link is acceptable. Share the scheduling link and ask them to pick a time. Do not ask the user for duration; assume 30 minutes by default unless they specify otherwise.",
  stripe:
    "Use Stripe actions only when the user explicitly asks to pay, subscribe, or manage billing.",
};

export function buildToolInstructionBlock(connectors: WorkspaceConnector[]) {
  if (!connectors.length) return "";

  const lines: string[] = [];
  lines.push("Connected actions:");

  for (const c of connectors) {
    const key = String(c.provider);
    const user = (c.tool_instructions ?? "").trim();
    const fallback = DEFAULTS[key] ?? "Use this action when it is relevant to the user request.";
    lines.push(`- ${key}: ${user || fallback}`);
  }

  lines.push("");
  lines.push(
    "When you call an action, explain what you are doing and then continue the conversation using the action result.",
  );

  return lines.join("\n");
}
