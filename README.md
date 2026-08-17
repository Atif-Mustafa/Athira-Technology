# Athira Technology Web

Athira Technology Web is the public product and services website for a planned, human-reviewed AI Software Engineer made up of seven specialized SDLC agents. It also provides a secure business-enquiry workflow that validates submissions, applies abuse controls, and sends accepted enquiries by email without creating an application database record.

This repository does **not** contain production AI-agent execution, customer accounts, authentication, a database, CMS, analytics, CRM, billing, subscriptions, or a real admin system. Product capabilities remain planned or illustrative unless a page explicitly says otherwise.

## Technology

- Next.js 16.3.0 with the App Router
- React and React DOM 19.2.8
- TypeScript 5.8 and Tailwind CSS 4
- Resend for server-side contact email delivery
- Upstash Redis and Upstash Ratelimit for distributed production rate limiting
- Zod for shared contact validation
- Vitest, React Testing Library, Playwright, and axe-core
- npm and `package-lock.json` as the only package-management path

Node.js 22 is required so local development, GitHub Actions, and Vercel use the same runtime major.

## Setup

Install the exact locked dependency tree and copy the environment template:

```bash
npm ci
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Do not commit `.env.local` or real credentials. The repository ignores `.env*` except `.env.example`.

## Commands

```bash
npm run dev           # Development server on port 3000
npm run lint          # Non-interactive ESLint check
npm run typecheck     # TypeScript check without emitted output
npm run test          # Vitest watch mode
npm run test:unit     # Unit and component tests once
npm run test:api      # Contact API tests once
npm run test:run      # All Vitest suites once
npm run test:coverage # Text, HTML, and LCOV coverage
npm run build         # Optimized production build
npm run start         # Production server on port 3000
npm run test:e2e      # Full Chromium Playwright suite on port 3100
npm run test:e2e:smoke # Public-route and responsive smoke checks
npm run test:a11y     # axe accessibility suite
npm run clean         # Cross-platform generated-output cleanup
```

Install Chromium once after a clean dependency install:

```bash
npx playwright install chromium
```

## Environment variables

Variables prefixed with `NEXT_PUBLIC_` are intentionally available to browser bundles. Every other variable below is server-only.

| Variable | Local development | Vercel preview | Vercel production | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Optional; defaults to `http://localhost:3000` | Required HTTPS preview/branch origin | Required canonical HTTPS origin | Metadata, canonical URLs, structured data, robots, sitemap, and accepted contact origin |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Optional | Optional, owner-approved public mailbox only | Public fallback displayed on `/contact` |
| `RESEND_API_KEY` | Required to exercise real local delivery | Required | Required | Server-only Resend credential |
| `CONTACT_FROM_EMAIL` | Required to exercise real local delivery | Required | Required | Verified Resend sender; may include a display name |
| `CONTACT_TO_EMAIL` | Required to exercise real local delivery | Required | Required | Private approved recipient; never returned by the API |
| `UPSTASH_REDIS_REST_URL` | Optional; local memory limiter is explicit | Required | Required | HTTPS Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Optional with no URL | Required | Required | Server-only Upstash token |
| `RATE_LIMIT_HASH_SECRET` | Optional local-only default | Required, 32+ characters | Required, 32+ characters | Keyed hash secret for pseudonymous rate-limit identifiers |
| `CONTACT_ALLOWED_ORIGINS` | Optional | Optional | Optional | Comma-separated additional origins, with no paths |

Vercel supplies `VERCEL`, `VERCEL_ENV`, and forwarding headers. Do not add them as project secrets or imitate them in a public deployment. Runtime validation permits a process-local limiter only outside production and fails closed when production email or distributed-rate-limit configuration is incomplete.

See [deployment.md](docs/deployment.md) for account setup, environment scoping, preview behavior, production checks, and rollback instructions.

## Contact architecture

The contact page remains a Server Component. Only `ContactForm` is a Client Component because it owns form state, focus management, and the fetch request.

```text
Browser ContactForm
  -> shared Zod validation
  -> POST /api/contact (JSON, max 16 KiB, no cache)
  -> strict server validation and honeypot check
  -> origin validation and trusted Vercel client address
  -> HMAC-SHA256 pseudonymous rate-limit key
  -> Upstash: 3 accepted attempts per 15 minutes
  -> escaped plain-text and HTML email
  -> Resend, with the visitor email used only as replyTo
  -> safe 202 response with a request identifier
```

`src/lib/contact/schema.ts` is authoritative for fields, trimming, email normalization, allowed selections, minimum/maximum lengths, consent, the honeypot, unknown-field rejection, and structured field errors. Client validation improves usability but does not replace server validation.

The route accepts JSON only, limits the UTF-8 body to 16 KiB, does not cache responses, validates the browser origin, and never exposes provider diagnostics, secrets, infrastructure details, or the private recipient. Honeypot submissions receive a neutral accepted response but are neither rate-limited nor emailed. Provider rejection is not reported as delivery success.

Production rate limiting is distributed and fail-closed. The raw client address is read only from Vercel-controlled forwarding headers, converted immediately to a keyed HMAC, never logged, and not sent to Upstash. The local in-memory limiter is for development and deterministic tests only. IP-derived controls can affect shared offices, carrier-grade NAT, VPNs, and mobile networks; they are an abuse signal, not an identity system.

Resend is behind a small `ContactEmailProvider` interface and is mocked in automated tests. All user-controlled HTML is escaped. The sender and recipient come only from server configuration, and the validated visitor address is `replyTo`, never `from`. No attachment, database write, auto-reply, or marketing subscription occurs.

Cloudflare Turnstile is not included in this milestone. Honeypot plus distributed rate limiting avoids an additional third-party browser script and its privacy/accessibility failure modes. Turnstile is the recommended escalation if monitored abuse remains material; it must be optional, server-verified, accessible, and documented before introduction.

## Contact UI and privacy behavior

The form supports idle, client-validation, submitting, server-validation, rate-limited, provider/configuration unavailable, unexpected-error, and confirmed-success states. Errors are associated with fields, a focused error summary is rendered, success is announced and focused, duplicate submits are blocked, values survive recoverable failures, and fields reset only after confirmed provider acceptance. Consent is required and never preselected.

The draft privacy notice describes the fields, purpose, Resend, Upstash, limited technical data, access assumptions, and the absence of analytics and application database persistence. It deliberately does not invent a retention period, legal basis, data residency, DPA coverage, or compliance status. The project owner and qualified legal reviewer must approve the visible retention placeholder and rights contact process before launch.

## Public route map

| Route | Purpose |
|---|---|
| `/` | Enterprise product-story homepage |
| `/ai-software-engineer` | Product model, governance, integrations, and limitations |
| `/agents` | Seven-agent lifecycle overview |
| `/agents/planning` | Planning Agent detail |
| `/agents/design` | Design Agent detail |
| `/agents/development` | Development Agent detail |
| `/agents/testing` | Testing Agent detail |
| `/agents/deployment` | Deployment Agent detail |
| `/agents/monitoring` | Monitoring Agent detail |
| `/agents/documentation` | Documentation Agent detail |
| `/services` | AI and software-engineering services |
| `/pricing` | Indicative engagement options; no checkout |
| `/blog` | Typed local article listing |
| `/blog/multi-agent-systems-for-the-sdlc` | Product-architecture article |
| `/blog/human-approval-in-ai-assisted-development` | Governance article |
| `/blog/traceable-ai-engineering-workflows` | Engineering-operations article |
| `/contact` | Secure business-enquiry form |
| `/privacy` | Draft privacy notice requiring review |
| `/terms` | Draft website terms requiring review |

Supporting routes:

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Static, noindex demonstration with no authentication or admin capability |
| `POST /api/contact` | Validated, rate-limited email delivery; no database persistence |
| `GET /api/health` | Minimal `{ "status": "ok" }` process liveness response |
| `/robots.txt` | Disallows admin and API areas |
| `/sitemap.xml` | Implemented indexable public routes only |

The health endpoint does not test Resend, Upstash, DNS, mailbox delivery, or environment readiness. It intentionally avoids secrets, versions, environment names, timestamps, and dependency calls.

## Project structure

```text
src/
|-- app/
|   |-- (marketing)/
|   |-- admin/
|   |-- api/contact/
|   |-- api/health/
|   |-- robots.ts
|   `-- sitemap.ts
|-- components/
|   |-- forms/ContactForm.tsx
|   |-- agents/
|   |-- marketing/
|   |-- seo/
|   `-- ui/
|-- config/
|   |-- security.ts
|   `-- site.ts
|-- content/
|   |-- contact.ts
|   |-- agents.ts
|   |-- blog.ts
|   `-- marketing content modules
|-- lib/contact/schema.ts
`-- server/
    |-- env.ts
    `-- contact/
        |-- email.ts
        |-- handler.ts
        |-- logging.ts
        |-- rate-limit.ts
        `-- request.ts
tests/
|-- unit/
|-- api/
`-- e2e/
```

Content modules are typed plain data with no JSX or callbacks. Server-only credentials and provider integrations stay below `src/server`; no server configuration is imported by the contact Client Component.

## Security, SEO, accessibility, and performance

- Static-compatible CSP with no wildcard sources and no production `unsafe-eval`; `unsafe-inline` is retained for Next.js inline bootstrapping/styles without forcing nonce-based dynamic rendering.
- `X-Content-Type-Options`, frame protection, strict referrer policy, limited permissions policy, and cross-origin opener isolation apply site-wide.
- HSTS and `upgrade-insecure-requests` are emitted only for Vercel production when the configured public origin is HTTPS; localhost and previews do not receive HSTS.
- Metadata, canonical URLs, structured data, robots, and sitemap use `NEXT_PUBLIC_SITE_URL`.
- The admin demonstration is noindex and robots excludes admin/API paths.
- The contact form has visible labels, keyboard focus, associated validation, live status, reduced-motion support, and mobile overflow coverage.
- Public content stays server-rendered/static; the contact route is dynamic and uncached, while the interactive client boundary is limited to the form.

## Testing and CI

Vitest covers content, schema normalization and limits, environment validation, safe email rendering, request IDs, HMAC keys, rate limiting, privacy-safe logging, API status/error contracts, and contact UI states. Provider and limiter dependencies are injected and mocked; tests cannot send real email.

Playwright covers all public routes, contact rendering and mocked outcomes, keyboard/mobile behavior, security headers, and axe checks for the initial, validation, submitting, success, and failure contact states. The runner builds and starts the production Next.js application on port 3100. Browser interception prevents contact E2E tests from reaching the real route.

GitHub Actions performs a clean npm install, lint, type-check, unit/component tests, API tests, production build, Playwright/axe, and production dependency audit. It has no deployment token and does not deploy or send email. Vercel Git integration should create previews and promote the reviewed branch after CI passes.

## Deployment and operations

- [Vercel deployment runbook](docs/deployment.md)
- [Contact operations and incident runbook](docs/contact-operations.md)

Contact logs contain only timestamp, request ID, outcome, validation state, rate-limit state, provider state, and duration. See the operations runbook for safe Vercel log inspection, abuse/configuration/provider signals, request-ID correlation, and response steps.

## Known limitations

- Real delivery cannot be certified from source or mocked tests; the owner must configure and verify production Resend, mailbox, Upstash, DNS, Vercel, and HTTPS infrastructure.
- Resend acceptance confirms provider handoff, not inbox placement or human review.
- The honeypot and IP-based rate limit reduce common abuse but do not stop distributed or sophisticated bots.
- The privacy and terms pages remain conspicuous drafts and require professional review plus owner decisions before launch.
- No third-party monitoring is installed; operations depend on Vercel and provider dashboards/logs.
- The admin dashboard remains a noindex static demonstration with no sensitive data or functionality.
- Chromium is the current E2E browser; Firefox and WebKit coverage remain future work.
