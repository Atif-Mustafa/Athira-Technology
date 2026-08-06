# Vercel deployment runbook

This runbook prepares the Athira Technology website for Vercel preview and production deployment. It does not authorize a launch: production still requires approved accounts, DNS, mailbox ownership, legal content, and a successful end-to-end delivery check.

## Deployment architecture

- GitHub Actions is the quality gate and does not deploy.
- Vercel Git integration creates preview deployments and promotes the selected production branch.
- Next.js remains framework-native; no `vercel.json` is required.
- Resend sends contact email from a verified sender domain.
- Upstash Redis provides distributed rate limiting to Vercel functions.
- The application stores no contact database record.

Node.js 20.9 or newer is required. Configure Vercel to use Node.js 22 to match CI.

## 1. Connect the repository

1. Create or select the Vercel project under the approved Athira Technology account.
2. Import the Git repository using Vercel Git integration.
3. Confirm Framework Preset is Next.js, install command is `npm ci`, build command is `npm run build`, and no output-directory override is set.
4. Set Node.js to 22.
5. Select the approved production branch. Do not deploy from an unreviewed feature branch.
6. Keep deployment credentials out of GitHub Actions and the repository.

## 2. Configure Resend

1. Create or select an organization-owned Resend account.
2. Add the approved sending domain and publish the DNS records supplied by Resend.
3. Wait for sender-domain verification. Do not use a fabricated or personal fallback sender.
4. Create a narrowly scoped production API key and a separate preview key where operational separation is required.
5. Set `CONTACT_FROM_EMAIL` to an address on the verified domain. A display-name form such as `Athira Technology <contact@approved-domain>` is supported.
6. Set `CONTACT_TO_EMAIL` to the approved, monitored recipient mailbox.
7. Decide mailbox access, forwarding, retention, deletion, and incident ownership before launch.

The visitor's validated address is used as `replyTo`; the application never spoofs it as the sender. Provider acceptance is not proof of inbox placement.

## 3. Configure Upstash

1. Create a production Redis database in the approved Upstash account and region.
2. Copy its HTTPS REST URL and REST token into the corresponding Vercel server-only variables.
3. Generate an independent cryptographically random `RATE_LIMIT_HASH_SECRET` of at least 32 characters. Do not reuse an API token, user password, or encryption key.
4. Use separate preview and production databases or prefixes/accounts when environment isolation is required.
5. Review Upstash retention, region, access, and contractual settings with the privacy owner.

Production permits three contact attempts per keyed client-address hash per 15 minutes. It fails closed when Upstash is missing or unavailable; there is no process-local production fallback.

## 4. Environment scope

Use Vercel's encrypted Environment Variables settings. Variables without `NEXT_PUBLIC_` must remain server-only.

### Local development

- `NEXT_PUBLIC_SITE_URL`: optional; defaults to `http://localhost:3000`.
- Resend variables: required only when intentionally testing real local delivery.
- Upstash variables: optional. Their absence selects the explicit local memory limiter.
- Never use the production recipient or production provider key for routine local tests.

### Preview

- Add all Resend, Upstash, hash-secret, sender, and recipient variables in Preview scope.
- Set `NEXT_PUBLIC_SITE_URL` to an HTTPS preview origin or stable branch alias so preview metadata is deterministic.
- Use a controlled test recipient and preview provider resources where possible.
- `CONTACT_ALLOWED_ORIGINS` is needed only for additional browser origins. The actual same-origin preview request is accepted automatically.
- HSTS is intentionally omitted from preview responses.
- Treat preview URLs as potentially accessible unless Vercel access controls are enabled. Do not enter real sensitive enquiry content.

### Production

- Set a real canonical HTTPS `NEXT_PUBLIC_SITE_URL` with no fabricated placeholder.
- Configure all Resend and Upstash variables and a 32+ character hash secret in Production scope.
- Set the optional public contact email only after the mailbox and process are approved.
- Do not manually set Vercel's system variables. The contact route relies on Vercel-controlled forwarding headers.
- HSTS is emitted only when Vercel identifies the production environment and the configured public URL is HTTPS.

## 5. Validate configuration before promotion

1. Compare Vercel Preview and Production variable names against `.env.example`; inspect names and scopes, never paste secret values into issues or logs.
2. Confirm no server variable begins with `NEXT_PUBLIC_`.
3. Confirm the public URL is absolute HTTPS and contains only the intended origin.
4. Confirm sender-domain verification is green in Resend and the recipient mailbox is monitored.
5. Confirm both Upstash values are present, the URL is HTTPS, and the hash secret has at least 32 characters.
6. Deploy a preview from a reviewed commit after GitHub Actions passes.
7. Open `/api/health`; expect exactly `{ "status": "ok" }`. This proves liveness only.
8. Submit one non-sensitive test enquiry on the preview. Expect an “Enquiry delivered” state and save the request ID.
9. Confirm the message appears in Resend and the controlled recipient mailbox. Confirm `replyTo` is the submitted test address.
10. Submit intentionally invalid input and confirm it is rejected without a provider delivery.
11. Confirm `/robots.txt`, `/sitemap.xml`, canonical metadata, CSP, and other security headers use the intended preview configuration.

Missing runtime secrets do not block a static build; `/api/contact` returns a safe `503` instead. Therefore a successful build alone is not environment-readiness evidence.

## 6. Custom domain and production launch

1. Add the approved custom domain in Vercel and follow the DNS records Vercel provides.
2. Verify both apex and chosen canonical host behavior; redirect duplicates to the chosen host in Vercel/domain settings where appropriate.
3. Wait for Vercel TLS issuance, then update `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS origin and redeploy.
4. Ensure the Resend sender-domain DNS remains verified after DNS changes.
5. Run the full repository verification commands from the README on the exact release commit.
6. Complete the checklist below before promoting the production deployment.

## Production checklist

- [ ] GitHub Actions passes on the exact release commit.
- [ ] Vercel production branch and Node.js 22 are correct.
- [ ] Canonical HTTPS URL and custom-domain redirects are verified.
- [ ] Resend domain, API key, sender, recipient, and monitored mailbox are approved.
- [ ] Upstash REST values and independent 32+ character hash secret are configured.
- [ ] No real secret is present in Git, build logs, static assets, or client bundles.
- [ ] One real non-sensitive end-to-end contact delivery succeeds in production.
- [ ] Invalid, oversized, origin-rejected, rate-limited, and unavailable responses remain safe.
- [ ] CSP and security headers are present; HSTS appears only on final production HTTPS.
- [ ] All public pages, health, robots, and sitemap return expected statuses.
- [ ] Privacy retention, mailbox access, service-provider terms, rights channel, and legal drafts are approved and updated.
- [ ] Operational owner knows the request-ID and failure-response procedure.
- [ ] Rollback target is identified before promotion.

## Rollback

1. In Vercel Deployments, select the last known-good production deployment and use the platform rollback/promote control.
2. If the contact workflow is the incident source, rotate or revoke affected Resend/Upstash credentials and temporarily remove the contact server configuration. The route will fail closed with `503`; it will not claim delivery.
3. Do not expose provider diagnostics to visitors. Publish an approved public fallback contact only if one exists.
4. Preserve privacy-safe request IDs, outcome categories, and provider event identifiers needed for investigation; do not copy message bodies into tickets.
5. Correct the issue on a new reviewed commit, pass CI and preview checks, then promote again.

Environment-variable rollback in Vercel requires a redeployment so server functions and build-time public metadata use the restored values consistently.

## Optional bot-verification escalation

Cloudflare Turnstile is not currently loaded, so the CSP includes no Cloudflare browser origin and no third-party bot script runs. If honeypot and distributed rate limiting do not control observed abuse, evaluate Turnstile as a separate change. Require server-side token verification, accessible failure text, graceful script failure, test keys outside production, deterministic mocks, updated CSP, and an updated privacy notice. It must supplement rather than replace rate limiting.
