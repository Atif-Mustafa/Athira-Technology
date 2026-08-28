export type ContactOutcome =
  | "accepted"
  | "accepted_duplicate"
  | "accepted_notification_degraded"
  | "malformed"
  | "unsupported_media_type"
  | "oversized"
  | "origin_rejected"
  | "validation_rejected"
  | "honeypot_rejected"
  | "configuration_unavailable"
  | "rate_limited"
  | "rate_limit_unavailable"
  | "persistence_unavailable"
  | "unexpected_failure";

export type ContactLogEvent = {
  timestamp: string;
  requestId: string;
  outcome: ContactOutcome;
  validation: "not_run" | "accepted" | "rejected";
  rateLimit: "not_run" | "allowed" | "blocked" | "unavailable";
  persistence: "not_run" | "created" | "existing" | "failed" | "update_failed";
  provider: "not_run" | "accepted" | "rejected" | "unavailable";
  durationMs: number;
};

export type ContactLogger = (event: ContactLogEvent) => void;

export const logContactEvent: ContactLogger = (event) => {
  const serialized = JSON.stringify({ event: "contact_submission", ...event });

  if (event.outcome.startsWith("accepted") || event.outcome === "honeypot_rejected") {
    console.info(serialized);
  } else if (event.outcome === "unexpected_failure") {
    console.error(serialized);
  } else {
    console.warn(serialized);
  }
};