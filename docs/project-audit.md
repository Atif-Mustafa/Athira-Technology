# Athira Technology — Project Audit

Audit date: 5 August 2026  
Scope: Next.js architecture, product design, frontend quality, SEO, accessibility, performance, security, testing, and deployment readiness.

## Executive summary

This repository is a partially completed Google AI Studio–generated marketing site that was migrated from Vite/React Router to Next.js. It is not production-ready: the primary Next.js build fails, all agent routes return HTTP 500, most navigation destinations return 404, SEO endpoints return HTTP 500, and the installed Next.js version has critical security advisories.

No source implementation files were changed during the audit. Running the requested checks refreshed the untracked `.next/` directory and updated the tracked generated file `tsconfig.tsbuildinfo` because incremental TypeScript compilation is enabled. The pre-existing `package.json` modification was left untouched.

## Current project summary

### Framework and versions

- Next.js: declared and locked at 15.1.7.
- React and React DOM: declared as `^19.0.1`; the lockfile resolves both to 19.2.8.
- TypeScript: 5.8.3 installed.
- Tailwind CSS: 4.3.3 installed.
- Motion: 12.43.0 installed.
- Lucide React: 0.546.0 installed.
- Router: Next.js App Router using `src/app`.
- Pages Router: not used in application source.
- Rendering: mostly Server Components with Client Component boundaries for navigation, animations, and icons.
- Package management: both npm and Bun lockfiles exist. `bun.lock` is stale and does not represent the complete Next.js dependency graph.

### Structure

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── agents/
│   │       ├── page.tsx
│   │       └── [slug]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   └── dashboard/page.tsx
│   ├── api/health/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── marketing/
│   ├── animations/
│   ├── ui/
│   └── duplicate legacy components
├── data/agents.tsx
└── lib/utils.ts
```

The root retains an obsolete Vite application shell, Express server, React Router components, migration scripts, and a second lockfile.

## Verification results

| Check | Result |
|---|---|
| `npm run typecheck:next` | Passes |
| `npm run build` | Fails while prerendering `/agents/planning` |
| `npm run lint:next` | Not usable; starts an interactive ESLint setup prompt |
| `npm test --if-present` | No-op; there is no test script |
| `npm run build:vite` | Fails because `src/main.tsx` does not exist |
| `npm audit --omit=dev` | 5 vulnerable production packages: 1 critical, 4 high |
| Desktop browser check | Homepage and admin render at 1280px |
| Mobile browser check | Homepage and admin fit at 390px without horizontal overflow |

The Next.js build fails with:

> Functions cannot be passed directly to Client Components

`agentsData` stores Lucide React component functions and passes them from Server Components into the client-only `src/components/IconRenderer.tsx`. Both the agent overview and detail pages cross this unsupported boundary.

## Existing route map

| Route | Source exists | Runtime | Assessment |
|---|---:|---:|---|
| `/` | Yes | 200 | Homepage renders |
| `/agents` | Yes | 500 | Broken server/client icon boundary |
| `/agents/planning` | Yes | 500 | Broken |
| `/agents/design` | Yes | 500 | Broken |
| `/agents/development` | Yes | 500 | Broken |
| `/agents/testing` | Yes | 500 | Broken |
| `/agents/deployment` | Yes | 500 | Broken |
| `/agents/monitoring` | Yes | 500 | Broken |
| `/agents/documentation` | Yes | 500 | Broken |
| `/admin` | No | 404 | Missing |
| `/admin/dashboard` | Yes | 200 | Static placeholder |
| `/api/health` | Yes | 200 | Returns health JSON |
| `/ai-software-engineer` | No | 404 | Missing |
| `/services` | No | 404 | Missing |
| `/pricing` | No | 404 | Missing |
| `/blog` | No | 404 | Missing |
| `/contact` | No | 404 | Missing |
| `/privacy` | No | 404 | Missing |
| `/terms` | No | 404 | Missing |
| `/robots.txt` | Two sources | 500 | Public file conflicts with metadata route |
| `/sitemap.xml` | Two sources | 500 | Public file conflicts with metadata route |

## What is complete

- App Router foundation and root layout.
- Dark visual theme and responsive marketing shell.
- Plus Jakarta Sans through `next/font`.
- Homepage hero and three feature cards.
- Reusable Button, Badge, and Card primitives.
- Reusable fade and stagger animation wrappers.
- Marketing navbar and footer.
- Seven agent records with names, descriptions, slugs, and metadata.
- Planning Agent has populated capabilities, workflow, benefits, and use cases.
- Static admin dashboard visual.
- Health API.
- Error, global error, 404, robots, and sitemap source files.
- Basic per-page metadata descriptions.
- Baseline mobile layouts: grids stack correctly and homepage CTAs become full-width.

## What is incomplete

- Agent overview and all seven agent pages are unusable at runtime.
- Six agents have empty capabilities, workflows, benefits, and use cases.
- Workflow, benefits, and use-case sections are not rendered even for Planning Agent.
- AI Engineer, services, pricing, blog, contact, privacy, and terms pages do not exist.
- There is no contact form, submission endpoint, email delivery, CRM integration, or validation.
- There is no real AI or Gemini functionality despite the dependency and environment variable.
- There is no real admin authentication, authorization, navigation, CRUD, database, or API.
- There are no tests, ESLint configuration, CI pipeline, analytics, CMS, or deployment documentation.
- There are no product images, screenshots, customer logos, testimonials, case studies, or social-proof assets.

## Admin panel assessment

An admin-themed page exists, but an admin panel does not meaningfully exist. The dashboard displays hardcoded statistics and activities, and its layout calls itself a migration placeholder.

It has no authentication, authorization, login route, sidebar, forms, actions, persistence, users, content management, agent management, settings management, role model, logout, or session handling.

The default Next.js app does not use the mock Express login. The obsolete server accepts the literal password `admin` and returns a fixed token, which would be critically insecure if exposed.

## Bugs and risks

### Critical

1. Production build fails because React component functions cross a Server/Client boundary.
2. The complete agent product area returns HTTP 500.
3. Installed Next.js 15.1.7 is reported by npm audit as a critical direct dependency, including RCE and authorization-bypass advisories.
4. `/admin/dashboard` is publicly accessible and contains no authorization.
5. The website makes claims such as SOC 2 compliance, zero-retention memory, and end-to-end encryption without supporting evidence.

### High

- Primary conversion and product links are missing or broken.
- `/robots.txt` and `/sitemap.xml` return 500 because static public files duplicate App Router metadata routes.
- `react-router-dom` is unused by the active app and is reported as a high-severity vulnerable dependency.
- No form-security implementation exists because no form exists.
- No security headers or Content Security Policy are configured.
- No linting or test gate exists.
- The stale Vite build cannot compile.

### Medium

- Two frameworks, two routing systems, and two package managers remain in one repository.
- Homepage and admin titles render with duplicated brand suffixes, such as `Athira Technology | The Autonomous SDLC Workforce | Athira Technology`.
- `metadataBase`, robots, and sitemap use the placeholder domain `athiratech.example.com`.
- Static sitemap entries point to nonexistent routes.
- The tracked `tsconfig.tsbuildinfo` creates recurring working-tree noise.
- `.next/` is not in `.gitignore`.
- `clean` uses `rm -rf`, which is not portable to the current Windows environment.
- Development runs on port 4000 while production start uses 3000 in the locally modified `package.json`.

## Architecture weaknesses

- Incomplete Vite-to-Next migration.
- Duplicate navbar and footer implementations: one React Router pair and one Next.js pair.
- UI components and content are coupled; `agents.tsx` must be TSX solely because it stores icon components.
- Client boundaries are broader than necessary.
- Deep relative imports are used while the configured `@/*` alias points at the repository root instead of `src`.
- TypeScript has `strict: false`, `allowJs: true`, and `skipLibCheck: true`.
- `Button` uses `any` casts and implements `asChild` by rendering a `<div>`.
- No content, service, validation, repository, or environment-schema layers exist.
- No backend or data model supports the advertised product.
- The package name is still the generic `react-example`.

## UI and UX weaknesses

The visual baseline is attractive but closer to a landing-page concept than a credible enterprise product site.

- Homepage contains only a hero and three cards.
- Primary CTAs lead to 404 pages.
- No explanation of how the seven agents work together.
- No platform screenshot, workflow diagram, demo, integrations, case studies, testimonials, FAQ, or final conversion section.
- No pricing information despite pricing navigation.
- Admin data is fake and has no interactions.
- Logo is a generic CSS shape rather than a brand asset.
- Product claims are broad and unsubstantiated.
- Agent pages cannot be visually evaluated because they return 500.
- Important content animates from `opacity: 0`; on slow or failed hydration, content can remain temporarily invisible.
- No loading, empty, success, or failure states exist for product workflows.

Mobile behavior is structurally sound at 390px: the homepage and admin dashboard do not overflow, cards stack, and CTAs remain usable. The mobile menu still lacks keyboard and screen-reader behavior.

## Accessibility weaknesses

Confirmed issues:

- Mobile menu button has no accessible name.
- It lacks `aria-expanded` and `aria-controls`.
- Active navigation is represented only by color; there is no `aria-current`.
- No skip-to-content link.
- Navigation has no accessible label.
- Homepage heading structure jumps from H1 directly to H3.
- `Button asChild` styles a non-focusable parent `<div>`, leaving the nested link without the intended focus ring or full clickable area.
- Motion does not respect `prefers-reduced-motion`.
- Mobile menu has no Escape handling, focus management, focus trap, or focus restoration.
- Some small slate text and status labels require formal contrast verification.
- Error pages are inconsistent; `global-error.tsx` has minimal unstyled semantics.

Positive findings:

- The homepage uses `nav`, `main`, and `footer` landmarks.
- The admin page uses `header` and `main`.
- Pages have a single H1.
- Lucide icons are mostly decorative.
- No current image-alt failures exist because there are no images.

## SEO weaknesses

- Most commercially important pages are 404.
- Agent pages are 500.
- Robots and sitemap endpoints are 500.
- The live title template duplicates the brand.
- The canonical production host is still an example domain.
- No canonical metadata is produced by the active Next.js app.
- No Open Graph, Twitter Card, favicon, application icon, or social image metadata.
- No Organization, SoftwareApplication, Product, FAQ, Article, or Breadcrumb structured data.
- Structured data in root `index.html` belongs to the obsolete Vite app and is not used by Next.js.
- Static and dynamic sitemap implementations conflict and disagree.
- The static sitemap advertises pages that do not exist.
- Dynamic sitemap dates use `new Date()`, making every page look freshly modified.
- No blog content or content taxonomy exists.
- Agent metadata provides no value while the routes fail.
- Heading hierarchy and thin homepage content weaken topical depth.
- No redirect exists from `/ai-engineer` to `/ai-software-engineer`.

## Performance weaknesses

- A production bundle report cannot be produced because the build fails.
- Motion is shipped for the navbar and multiple above-the-fold wrappers.
- The mobile menu uses an animation library for a simple disclosure interaction.
- `IconRenderer` is unnecessarily client-only.
- Unused Vite, Express, React Router, Gemini, and associated type dependencies increase installation and security surface.
- Two lockfiles undermine deterministic installs.
- No bundle analyzer, Core Web Vitals reporting, or performance budget exists.
- No caching or security-header strategy exists.
- No loading boundaries or route-level skeletons exist.
- Full static generation is blocked by the agent-page error.

### Images and fonts

- No raster or vector product images exist.
- `next/image` is therefore not used.
- No image dimensions, responsive sources, priority decisions, or optimization strategy exist.
- Plus Jakarta Sans is correctly integrated through `next/font` and produces self-hosted font output.
- Playfair Display is declared in the Tailwind theme but is not loaded by the active Next.js layout.
- The obsolete Vite HTML loads both fonts directly from Google.
- No favicon or Open Graph image exists.

## Security and form-validation concerns

- npm reports five vulnerable production packages: one critical and four high.
- Next.js 15.1.7 is a critical direct vulnerability according to the audit result.
- Unused React Router packages add a high-severity vulnerability and should be removed.
- The public admin dashboard has no authorization.
- The obsolete Express login uses a hardcoded password and fixed token.
- No contact form or validation exists.
- A future form requires server-side schema validation, rate limiting, anti-spam controls, input length limits, safe email rendering, and non-enumerating errors.
- No environment schema ensures required secrets are present or prevents server-only values from leaking client-side.
- No CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` is configured.
- The health route reveals environment and version details, creating minor fingerprinting exposure.

## Missing client requirements

Implementation should not invent the following:

- Production domain and deployment provider
- Final logo, favicon, colors, typography, and visual assets
- Approved positioning and verifiable compliance or security claims
- Final descriptions and workflows for all seven agents
- Supported integrations and actual AI-agent capabilities
- Pricing tiers, billing cycle, currency, trial, and CTA behavior
- Contact recipient, email provider, CRM, and qualification fields
- Blog owner, editorial workflow, categories, and CMS preference
- Admin users, roles, permissions, managed entities, and data source
- Authentication provider and session requirements
- Analytics, consent, cookie, and privacy requirements
- Legal-approved privacy policy and terms
- Support email, address, social URLs, and company details
- Gemini model, quota, data-retention, and safety requirements

## Deployment readiness

The project is not deployable in its current state.

Blocking issues:

- Next.js production build fails.
- Legacy Vite production build fails.
- Core routes return 500 or 404.
- Robots and sitemap return 500.
- Critical dependency vulnerabilities exist.
- No CI/CD quality gate exists.
- No deployment configuration or environment validation exists.
- Production URL and metadata are placeholders.
- Admin authorization is absent.

The health route works, and most marketing UI could be statically generated after the server/client boundary is corrected.

## Recommended target architecture

Use one framework and one package manager: Next.js App Router with npm.

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── ai-software-engineer/page.tsx
│   │   ├── services/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── contact/page.tsx
│   ├── (legal)/
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── (auth)/admin/login/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── contact/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── agents/
│   ├── forms/
│   ├── layout/
│   ├── marketing/
│   └── ui/
├── content/
│   ├── agents.ts
│   └── blog/
├── lib/
│   ├── env.ts
│   ├── seo.ts
│   ├── validation/
│   └── server/
└── types/
tests/
├── unit/
├── integration/
└── e2e/
```

Principles:

- Server Components by default; Client Components only for menus, forms, and necessary interaction.
- Keep content serializable; store icon keys rather than component functions.
- Use shared layout primitives and section components.
- Validate environment variables at startup.
- Validate all form input server-side.
- Protect every admin route server-side.
- Establish lint, type-check, unit, E2E, accessibility, and production-build gates in CI.

## Prioritized roadmap

### Milestone 0 — Stabilize and secure

- Fix the agent Server/Client boundary.
- Make `/agents` and all seven agent routes render.
- Remove duplicate robots and sitemap files.
- Correct metadata host and title templates.
- Upgrade Next.js and React as a tested compatible set outside the npm advisory ranges.
- Remove unused vulnerable React Router dependencies.
- Configure ESLint.
- Enable strict TypeScript incrementally.
- Make the production build pass.
- Add `.next/` and `*.tsbuildinfo` to `.gitignore`.

### Milestone 1 — Complete the product website

- Build AI Engineer and Services pages.
- Complete content for all seven agents.
- Render capabilities, workflow, benefits, and use cases.
- Expand homepage with proof, workflow, integrations, agent system, use cases, FAQ, and final CTA.
- Introduce shared layout and section components.
- Implement reduced-motion support and accessibility fixes.

### Milestone 2 — Conversion and legal

- Implement pricing.
- Implement contact page and form.
- Add server-side validation, rate limiting, anti-spam, email delivery, and safe error handling.
- Add approved Privacy and Terms pages.
- Replace unsupported compliance claims with approved copy.

### Milestone 3 — Blog and SEO

- Implement blog index and article routes.
- Select local MDX or a CMS.
- Add canonical, Open Graph, Twitter, icon, and structured-data support.
- Add breadcrumbs and Article schema.
- Generate one authoritative sitemap and robots endpoint.
- Add redirects for legacy URLs.

### Milestone 4 — Real admin application

- Define admin requirements and data model.
- Add authentication, sessions, roles, and authorization.
- Protect routes in middleware and server code.
- Add admin navigation and real CRUD interfaces.
- Remove hardcoded dashboard data.
- Add audit logging and secure secret management.

### Milestone 5 — QA and deployment

- Add unit and integration tests.
- Add Playwright E2E tests for public routes and forms.
- Add automated accessibility checks.
- Add CI for lint, strict type-check, tests, build, and dependency audit.
- Verify mobile, tablet, and desktop breakpoints.
- Add performance budgets and Web Vitals monitoring.
- Document environment variables and deployment procedures.

## Exact likely file operations

This assumes Next.js and npm are retained.

### Create

- `README.md`
- `eslint.config.mjs`
- `vitest.config.ts`
- `playwright.config.ts`
- `.github/workflows/ci.yml`
- `src/app/(marketing)/ai-software-engineer/page.tsx`
- `src/app/(marketing)/services/page.tsx`
- `src/app/(marketing)/pricing/page.tsx`
- `src/app/(marketing)/blog/page.tsx`
- `src/app/(marketing)/blog/[slug]/page.tsx`
- `src/app/(marketing)/contact/page.tsx`
- `src/app/(legal)/privacy/page.tsx`
- `src/app/(legal)/terms/page.tsx`
- `src/app/(auth)/admin/login/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/api/contact/route.ts`
- `src/components/agents/AgentIcon.tsx`
- `src/components/forms/ContactForm.tsx`
- `src/components/layout/Container.tsx`
- `src/components/layout/Section.tsx`
- `src/components/marketing/sections/*`
- `src/content/agents.ts`
- `src/lib/env.ts`
- `src/lib/seo.ts`
- `src/lib/validation/contact.ts`
- `src/lib/server/rate-limit.ts`
- `src/middleware.ts`
- `tests/unit/*`
- `tests/e2e/*`
- `public/favicon.ico`
- `public/images/og/*`
- `public/images/product/*`

### Modify

- `package.json`
- `package-lock.json`
- `.gitignore`
- `tsconfig.json`
- `next.config.ts`
- `.env.example`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/(marketing)/page.tsx`
- `src/app/(marketing)/agents/page.tsx`
- `src/app/(marketing)/agents/[slug]/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/error.tsx`
- `src/app/global-error.tsx`
- `src/app/not-found.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/marketing/Navbar.tsx`
- `src/components/marketing/Footer.tsx`
- `src/components/animations/FadeIn.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Card.tsx`

### Move

- `src/data/agents.tsx` → `src/content/agents.ts`

### Delete after migration

- `index.html`
- `server.ts`
- `vite.config.ts`
- `fix-agents.js`
- `update-theme.js`
- `bun.lock`
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/components/IconRenderer.tsx`
- `public/robots.txt`
- `public/sitemap.xml`
- `tsconfig.tsbuildinfo`
- `.next/`

Conditionally delete after Google AI Studio is no longer part of deployment:

- `metadata.json`
- `assets/.aistudio/.gitignore`

## Final assessment

The repository has a useful visual prototype and a reasonable App Router starting point, but it requires a stabilization milestone before feature development. The current build, routes, security posture, admin claim, and “production-ready” metadata do not match the implemented product.
