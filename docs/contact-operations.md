# Contact operations runbook

This runbook covers the implemented email-delivered contact workflow. It is intentionally limited to Vercel, Resend, Upstash, and the approved recipient mailbox; no third-party monitoring, analytics, CRM, or contact database is present.

## Request lifecycle

1. The browser performs shared client validation for usability.
2. `POST /api/contact` accepts JSON up to 16 KiB and performs authoritative strict validation.
3. A completed hidden honeypot receives a neutral response and is not delivered.
4. The server validates the browser origin and reads the client address only from trusted Vercel forwarding headers in production.
5. The address is immediately HMAC-hashed and checked against the distributed three-per-15-minute limit.
6. User fields are rendered into escaped HTML and plain text.
7. Resend sends to the configured recipient with the user address as `replyTo`.
8. Only provider acceptance produces the delivered UI state and a request identifier.

The application writes no enquiry to a database. Copies and delivery metadata may exist in Vercel request infrastructure, Resend, and the recipient mailbox according to account settings.

## Structured logs

Each contact attempt emits one JSON event named `contact_submission`. Allowed fields are:

- `timestamp`
- `requestId`
- `outcome`
- `validation`
- `rateLimit`
- `provider`
- `durationMs`

The logger never receives full names, email addresses, messages, raw IP addresses, API keys, recipient addresses, Upstash tokens, provider payloads, or provider message IDs.

Use the Vercel project dashboard's Logs view, select the relevant deployment/environment and `/api/contact` function, then filter for `contact_submission` or the exact request ID supplied by the visitor. Limit access to approved operators. Do not paste raw provider payloads or enquiry text into tickets.

## Outcome guide

| Outcome | Meaning | First check |
|---|---|---|
| `accepted` | Resend accepted the send request | Confirm provider event and mailbox delivery using approved tooling |
| `validation_rejected` | Input failed strict server validation | Look for repeated volume; do not inspect or log personal fields |
| `honeypot_rejected` | Basic bot signal was completed | Monitor frequency and distribution; response is intentionally neutral |
| `rate_limited` | A pseudonymous client key exceeded the limit | Check for bursts and shared-network false positives |
| `origin_rejected` | Browser origin was not same-origin or allowed | Check deployment URL and allowed-origin configuration before treating as attack |
| `configuration_unavailable` | Required email/rate-limit environment configuration is invalid | Compare variable names and scopes with `.env.example`; never print values |
| `rate_limit_unavailable` | Upstash failed, timed out, or trusted client address was unavailable | Check Upstash and Vercel status/configuration; production fails closed |
| `provider_rejected` | Resend returned a non-outage rejection | Check sender verification, request policy, and provider event using the request ID |
| `provider_unavailable` | Resend was unavailable or returned a server-side failure | Check provider status and retry only after recovery |
| `malformed`, `unsupported_media_type`, `oversized` | The request did not follow the public API contract | Repeated volume may indicate probing or a broken client |
| `unexpected_failure` | An unclassified exception escaped a dependency boundary | Correlate deployment logs by request ID and inspect stack data only in restricted logs |

## User-reported delivery issue

1. Ask for the displayed `contact_...` request ID, approximate time, and deployment hostname. Do not ask the visitor to resend sensitive message content through an insecure channel.
2. Find the matching structured Vercel event.
3. If `accepted`, inspect Resend's restricted dashboard for the corresponding time/idempotency key and verify recipient mailbox routing, quarantine, and spam handling.
4. If configuration, rate-limit, provider, or unexpected failure occurred, follow the outcome guide and check relevant provider status pages.
5. Tell the visitor only whether delivery was accepted, not accepted, or remains under investigation. Do not reveal recipient addresses, rate-limit keys, IP information, credentials, or provider diagnostics.
6. Record the operational category and remediation in the approved incident system without copying the enquiry body.

## Abuse response

1. Establish whether `honeypot_rejected`, `rate_limited`, malformed, oversized, or origin-rejected events increased relative to normal traffic.
2. Confirm the public client has not regressed before tightening controls.
3. Rotate `RATE_LIMIT_HASH_SECRET` only when compromise or policy requires it; rotation resets effective rate-limit identity and should be coordinated.
4. Adjusting the numeric threshold is a reviewed code change with tests, not an ad hoc provider-dashboard edit.
5. If distributed bots bypass IP controls, evaluate Cloudflare Turnstile as documented in the deployment runbook. Update accessibility, CSP, tests, and privacy disclosures in the same change.
6. For an active service-impacting attack, disable contact configuration to fail closed and use only an owner-approved public fallback channel.

IP-based controls are imperfect: offices, schools, VPNs, carrier-grade NAT, and mobile networks may share an address, while attackers may rotate addresses. A rate-limit key is neither a person nor an account, and it must not be used for profiling.

## Configuration and provider incidents

- Never log, echo, or paste environment values while comparing configuration.
- Verify Vercel variable name, environment scope, and redeployment status.
- Verify Resend sender-domain status and API-key scope before changing application code.
- Verify both Upstash REST variables, service status, and region/account access together.
- Rotate a suspected credential in its provider first, update Vercel, redeploy, and confirm the old credential is revoked.
- A `503` is the intended safe behavior when delivery or production abuse protection cannot operate.
- A `502` means the provider rejected the send; the UI preserves visitor entries and does not claim success.

## Retention and access decisions

Before production launch, the project owner and legal reviewer must approve:

- recipient-mailbox access and forwarding;
- mailbox, Resend, Upstash, and Vercel retention/deletion settings;
- service-provider agreements, regions, and any applicable international processing;
- a verified privacy-rights address and response procedure;
- incident ownership and escalation contacts.

The privacy page intentionally contains a visible unresolved retention placeholder. Do not remove it or publish a fabricated period. Avoid exporting contact data for ad hoc analysis; no analytics or CRM use is authorized by this milestone.

## Health and readiness

`GET /api/health` returns only `{ "status": "ok" }`. It confirms that the Next.js function can answer a liveness request. It does not call or verify Resend, Upstash, DNS, TLS, environment completeness, mailbox delivery, or legal readiness.

Readiness requires the deployment checklist plus one controlled end-to-end contact delivery in the target environment. Monitor the first production submissions for outcome-category anomalies without inspecting or expanding logged personal data.
