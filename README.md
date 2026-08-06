# Athira Technology Web

Athira Technology Web is a Next.js App Router prototype for presenting planned AI-assisted components across the software development lifecycle. This repository currently contains the public homepage, an agent overview, seven agent detail routes, a static admin-dashboard demo, metadata routes, and a health endpoint.

The project is in stabilization. It does not yet contain a production AI service, contact backend, authentication system, database, CMS, analytics integration, or real admin application.

## Technology

- Next.js 16.3.0
- React and React DOM 19.2.8
- TypeScript 5.8
- Tailwind CSS 4
- Motion 12
- Lucide React icons
- npm and `package-lock.json` for dependency management

Node.js 20.9 or newer is required.

## Setup

This project is npm-only. Do not create or commit lockfiles from another package manager.

```bash
npm ci
```

Copy the environment example when local overrides are needed:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_SITE_URL` | No for local development; yes for production metadata | Public origin used by the metadata base, robots route, and sitemap. Defaults safely to `http://localhost:3000`. |

Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin in production. No production hostname is assumed by the repository.

## Commands

```bash
npm run dev        # Next.js development server on port 3000
npm run lint       # Non-interactive ESLint check
npm run typecheck  # TypeScript check without generated incremental output
npm run test       # Vitest watch mode for local unit/component development
npm run test:run   # Run unit/component tests once
npm run test:coverage # Run unit/component tests and create coverage reports
npm run build      # Optimized production build
npm run start      # Production server on port 3000
npm run test:e2e   # Playwright smoke and accessibility suite on port 3100
npm run test:e2e:smoke # Playwright route and responsive smoke checks
npm run test:a11y  # Playwright axe accessibility checks
npm run clean      # Cross-platform removal of generated build directories
```

Lint, type-check, tests, and build are separate quality gates:

- `lint` checks ESLint rules and code-quality conventions.
- `typecheck` checks TypeScript contracts without emitting files.
- `test:run` executes Vitest unit and component tests in JSDOM.
- `test:e2e` executes Playwright browser tests against a production build.
- `test:a11y` executes the focused automated accessibility subset.
- `build` verifies that Next.js can create the optimized production application.

Do not describe lint, type-check, or build as automated test results.

## Automated quality baseline

### Unit and component testing

Vitest runs TypeScript tests in a deterministic, isolated JSDOM environment. React Testing Library and `jest-dom` provide semantic component queries and DOM assertions. The initial suite protects:

- site URL configuration and safe fallback behavior,
- serializable seven-agent content and incomplete records,
- typed decorative agent-icon rendering,
- semantic shared buttons and links,
- mobile-navigation disclosure, Escape handling, focus restoration, and current-page semantics.

Use `npm run test` while developing and `npm run test:run` for a single CI-style run. `npm run test:coverage` writes HTML and LCOV output to `coverage/`. Coverage thresholds are intentionally deferred until more product functionality exists.

### End-to-end and accessibility testing

Playwright uses Chromium and starts the optimized Next.js application on isolated port `3100`, avoiding the known local port `3000` conflict. Outside CI, `npm run test:e2e` builds the application before starting the test server. CI performs the production build as its own quality gate before Playwright starts the server.

Install the local Chromium binary once after `npm ci`:

```bash
npx playwright install chromium
```

On Linux systems missing browser libraries, use:

```bash
npx playwright install --with-deps chromium
```

The smoke suite covers implemented pages, all seven agent routes, the admin demonstration, health, robots, sitemap, desktop/mobile horizontal overflow, and the custom 404 behavior for planned routes. The accessibility suite runs axe against the homepage, agent overview, planning agent, one incomplete agent, and admin demonstration. Serious and critical violations fail the suite; no axe rules are disabled.

Playwright HTML output is written to `playwright-report/`, and failure traces, screenshots, or videos are written under `test-results/playwright/`.

### Continuous integration

`.github/workflows/ci.yml` runs on pull requests to `main` and pushes to `main`, `feat/**`, and `improve/**`. It uses Node.js 22 with npm caching and requires all of the following to pass:

1. clean npm installation,
2. lint,
3. TypeScript checking,
4. unit/component tests,
5. production build,
6. Chromium installation,
7. Playwright smoke and accessibility tests,
8. production dependency audit.

Playwright reports are uploaded only when the workflow fails. The workflow does not deploy the application.

## Active routes

| Route | Purpose |
|---|---|
| `/` | Public homepage |
| `/agents` | Agent overview |
| `/agents/planning` | Planning Agent detail |
| `/agents/design` | Design Agent detail |
| `/agents/development` | Development Agent detail |
| `/agents/testing` | Testing Agent detail |
| `/agents/deployment` | Deployment Agent detail |
| `/agents/monitoring` | Monitoring Agent detail |
| `/agents/documentation` | Documentation Agent detail |
| `/admin/dashboard` | Static, noindex admin-dashboard demonstration |
| `/api/health` | Minimal application health response |
| `/robots.txt` | Next.js robots metadata route |
| `/sitemap.xml` | Sitemap containing only implemented public routes |

Navigation also references planned marketing routes that are not implemented in this milestone. See Known limitations.

## Project structure

```text
src/
|-- app/
|   |-- (marketing)/
|   |   |-- agents/
|   |   `-- page.tsx
|   |-- admin/
|   |-- api/health/
|   |-- layout.tsx
|   |-- robots.ts
|   `-- sitemap.ts
|-- components/
|   |-- agents/
|   |-- animations/
|   |-- marketing/
|   `-- ui/
|-- config/site.ts
|-- content/agents.ts
`-- lib/utils.ts
tests/
|-- unit/
`-- e2e/
```

The application uses only the Next.js App Router. The previous Vite, Express, and React Router migration path has been removed.

## Server and Client Component boundaries

Components are Server Components unless they require browser interaction.

- Route pages, agent rendering, cards, icons, metadata, robots, and sitemap remain server-rendered.
- The marketing navbar is a Client Component because it manages mobile-menu state, keyboard events, current-path state, and focus restoration.
- Animation wrappers are Client Components because Motion depends on browser behavior and the reduced-motion preference.

Do not add `"use client"` to route or content modules merely to work around serialization errors. Move interactive behavior into the smallest practical leaf component instead.

## Serializable agent-content model

`src/content/agents.ts` contains plain serializable data. Agent records store a typed icon key such as `"planning"` or `"testing"`; they do not store React components, functions, or JSX.

`src/components/agents/AgentIcon.tsx` maps that key to a Lucide component in the rendering layer. This keeps the content model portable and prevents React functions from crossing a Server Component to Client Component boundary.

Capabilities, workflows, benefits, and use cases remain empty where content has not been approved. The UI labels those areas as future content instead of inventing details.

## Accessibility foundation

The current foundation includes:

- Skip-to-content navigation
- Labelled navigation landmarks
- Mobile-menu accessible name, state, and controls relationship
- Escape-key closing and focus restoration
- Current-page navigation semantics
- Visible keyboard focus
- Reduced-motion support
- Server-visible content that does not depend on animation hydration
- Corrected homepage and agent-card heading hierarchy

Accessibility should continue to be verified as new pages and forms are added.

## Admin dashboard status

`/admin/dashboard` is a static demonstration only. It has no authentication, authorization, live data, persistence, or administrative actions. Its values and activity entries are explicit placeholders, and the route is configured with `noindex` metadata.

Do not place sensitive information on this route. A future admin milestone must define requirements, roles, a data model, an authentication provider, and server-side authorization before adding real functionality.

## Known limitations

- `/ai-software-engineer`, `/services`, `/pricing`, `/blog`, `/contact`, `/privacy`, and `/terms` are planned but not implemented.
- Homepage and footer links to those planned routes currently resolve to the application 404 page.
- Six agent records intentionally omit detailed capabilities and workflow content pending approval.
- Product integrations, compliance controls, performance claims, and production capabilities are not certified by this codebase.
- The automated suite is an initial architecture and route baseline; it does not yet test forms, authentication, persistence, CMS behavior, analytics, or AI workflows because those features do not exist.
- Coverage thresholds are not yet enforced.
- Chromium is the only required E2E browser; Firefox and WebKit coverage are deferred.
- There is no contact form or backend.
- There is no AI or Gemini integration.
- There is no real admin system.
- There are no production brand images, social images, or favicon assets yet.

## Future milestones

Future work may include completing the marketing routes, approved agent content, pricing and legal content, a validated contact workflow, blog architecture, richer SEO assets, broader automated coverage, and a separately scoped authenticated admin application.

These are roadmap items, not completed features.
