export type ContactOutcome =
  | "accepted"
  | "malformed"
  | "unsupported_media_type"
  | "oversized"
  | "origin_rejected"
  | "validation_rejected"
  | "honeypot_rejected"
  | "configuration_unavailable"
  | "rate_limited"
  | "rate_limit_unavailable"
  | "provider_rejected"
  | "provider_unavailable"
  | "unexpected_failure";

export type ContactLogEvent = {
  timestamp: string;
  requestId: string;
  outcome: ContactOutcome;
  validation: "not_run" | "accepted" | "rejected";
  rateLimit: "not_run" | "allowed" | "blocked" | "unavailable";
  provider: "not_run" | "accepted" | "rejected" | "unavailable";
  durationMs: number;
};

export type ContactLogger = (event: ContactLogEvent) => void;

export const logContactEvent: ContactLogger = (event) => {
  const serialized = JSON.stringify({ event: "contact_submission", ...event });

  if (event.outcome === "accepted" || event.outcome === "honeypot_rejected") {
    console.info(serialized);
  } else if (event.outcome === "unexpected_failure") {
    console.error(serialized);
  } else {
    console.warn(serialized);
  }
};
