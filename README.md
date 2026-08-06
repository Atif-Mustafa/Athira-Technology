# Athira Technology Web

Athira Technology Web is the public product and services website for a planned, human-reviewed AI Software Engineer made up of seven specialized SDLC agents. The site explains the product direction, agent responsibilities, professional services, indicative engagement options, educational articles, and current implementation limitations.

This repository is a public Next.js website. It does **not** contain a production AI platform, live agent execution, customer integrations, authentication, a database, CMS, analytics, contact delivery, billing, or a real admin system.

## Technology

- Next.js 16.3.0 using the App Router
- React and React DOM 19.2.8
- TypeScript 5.8
- Tailwind CSS 4
- Lucide React icons
- Motion 12, retained for the existing reduced-motion-aware animation primitive
- Vitest, React Testing Library, Playwright, and axe-core
- npm and `package-lock.json` as the only package-management path

Node.js 20.9 or newer is required.

## Setup

Install the exact locked dependency tree:

```bash
npm ci
```

Copy the environment example when local overrides are needed:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_SITE_URL` | Required for production metadata; optional locally | Public origin for metadata, canonical URLs, structured data, robots, and sitemap. Falls back to `http://localhost:3000`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Public contact address shown on the contact page after a real mailbox and handling process are approved. Invalid or missing values produce an honest placeholder. |

No production hostname or contact address is fabricated in the repository.

## Commands

```bash
npm run dev          # Development server on port 3000
npm run lint         # Non-interactive ESLint check
npm run typecheck    # TypeScript check without emitted output
npm run test         # Vitest watch mode
npm run test:run     # Unit and component tests once
npm run test:coverage # Unit/component tests with text, HTML, and LCOV coverage
npm run build        # Optimized production build
npm run start        # Production server on port 3000
npm run test:e2e     # Playwright smoke and accessibility suites on port 3100
npm run test:e2e:smoke # Route, navigation, CTA, and responsive smoke checks
npm run test:a11y    # Focused axe accessibility checks
npm run clean        # Cross-platform generated-output cleanup
```

Install the Chromium binary once after a clean dependency install:

```bash
npx playwright install chromium
```

## Public route map

| Route | Purpose |
|---|---|
| `/` | Enterprise product-story homepage |
| `/ai-software-engineer` | Product model, coordination, review, governance, integrations, and limitations |
| `/agents` | Seven-agent lifecycle overview |
| `/agents/planning` | Planning Agent detail |
| `/agents/design` | Design Agent detail |
| `/agents/development` | Development Agent detail |
| `/agents/testing` | Testing Agent detail |
| `/agents/deployment` | Deployment Agent detail |
| `/agents/monitoring` | Monitoring Agent detail |
| `/agents/documentation` | Documentation Agent detail |
| `/services` | Eight AI and software-engineering service categories |
| `/pricing` | Indicative Starter, Growth, and Enterprise engagement options |
| `/blog` | Local typed article listing |
| `/blog/multi-agent-systems-for-the-sdlc` | Product-architecture article |
| `/blog/human-approval-in-ai-assisted-development` | Governance article |
| `/blog/traceable-ai-engineering-workflows` | Engineering-operations article |
| `/contact` | Static, non-submitting contact-form demonstration |
| `/privacy` | Draft privacy content requiring legal review |
| `/terms` | Draft website terms requiring legal review |

Supporting routes:

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Static, noindex demonstration with no authentication or admin capability |
| `/api/health` | Minimal application-health response |
| `/robots.txt` | Next.js metadata route; disallows admin and API areas |
| `/sitemap.xml` | Implemented, indexable public routes only |

## Project and content architecture

```text
src/
|-- app/
|   |-- (marketing)/
|   |   |-- agents/[slug]/
|   |   |-- ai-software-engineer/
|   |   |-- blog/[slug]/
|   |   |-- contact/
|   |   |-- pricing/
|   |   |-- privacy/
|   |   |-- services/
|   |   `-- terms/
|   |-- admin/
|   |-- api/health/
|   |-- layout.tsx
|   |-- robots.ts
|   `-- sitemap.ts
|-- components/
|   |-- agents/
|   |-- marketing/
|   |-- seo/
|   `-- ui/
|-- config/site.ts
|-- content/
|   |-- agents.ts
|   |-- blog.ts
|   |-- marketing.ts
|   |-- pricing.ts
|   |-- product.ts
|   |-- services.ts
|   `-- shared.ts
`-- lib/
    |-- seo.ts
    `-- utils.ts
tests/
|-- unit/
`-- e2e/
```

Marketing copy is stored as typed plain data rather than embedded in reusable presentation components. Content modules contain no JSX, React components, or callbacks. Icons are represented by typed keys and converted to Lucide components only in the rendering layer.

The seven-agent model preserves stable slugs and supplies agent-specific purpose, problems, inputs, workflow, outputs, capabilities, human checkpoints, scenario, integration categories, governance considerations, FAQs, metadata, and previous/next navigation.

## Server and Client Component boundaries

Public route pages, content rendering, icon maps, FAQ disclosure markup, structured data, robots, sitemap, and static contact fields are Server Components. Agent and blog dynamic routes use `generateStaticParams` with `dynamicParams = false`, so known records are generated as static HTML and unknown slugs resolve to the 404 boundary.

The marketing navbar is the primary Client Component because it needs current-path state, mobile-menu state, keyboard Escape handling, and focus restoration. New page content does not add browser JavaScript merely for layout or disclosure behavior. FAQs use native `details` and `summary` elements.

## Blog foundation

`src/content/blog.ts` defines the local article model and three educational articles. Every record has a unique slug, summary, description, author label, publish/update dates, reading time, category, structured sections, and related-article slugs.

The listing and article pages are statically generated. The data model is intentionally portable so a future, reviewed CMS adapter can replace the local source without coupling article content to React components.

## SEO architecture

- `src/config/site.ts` validates the environment-based public origin.
- `src/lib/seo.ts` creates canonical, Open Graph, and Twitter metadata without hardcoding a production domain.
- Root Organization structured data identifies Athira Technology.
- Product pages use planned-product SoftwareApplication schema without ratings, offers, or unsupported operational claims.
- FAQ pages use FAQ structured data matching visible content.
- Blog details use Article and Breadcrumb structured data.
- Agent and other nested pages use Breadcrumb structured data.
- `src/app/sitemap.ts` derives agent and article URLs from typed content and includes every implemented indexable public page.
- Admin and API paths are excluded from the sitemap and disallowed by robots; the admin demo also emits noindex metadata.

## Accessibility and performance

The shared foundation includes a skip link, labelled navigation landmarks, visible focus indicators, semantic buttons and links, one page-level heading, accessible mobile-menu state and keyboard behavior, native FAQ disclosures, labelled form fields, table headers and captioning, and a global reduced-motion mode.

Layouts are mobile-first and browser tests check desktop and mobile horizontal overflow. The public content is server-visible without animation hydration. The site uses system fonts, code-native interface visuals, a small SVG app icon, no remote media, and no network-dependent font or image loading.

## Contact-form status

The contact form is a keyboard-accessible static demonstration. Visitors can inspect its proposed fields, but the submit control is disabled and the application sends or stores nothing. There is no fake success state.

Before enabling submission, a future backend milestone must define server-side validation, spam and abuse controls, secure delivery, privacy handling, retention, recipients, error behavior, monitoring, and an approved contact address. Sensitive data must not be requested.

## Legal-page status

The privacy and terms pages are working drafts for product-development context. They are visibly labelled as requiring legal, commercial, and operational review. They are not legal advice or final production notices and do not claim that analytics, cookies, contact storage, profiling, international transfers, or online transactions currently occur.

## Automated quality baseline

Unit and content tests cover:

- valid site URL and contact-email configuration,
- complete and serializable seven-agent data,
- unique service and article slugs,
- indicative pricing labels without invented monetary values,
- working primary navigation and footer content,
- icon-key rendering,
- semantic buttons and links,
- mobile-menu accessibility,
- metadata and structured-data helpers.

Playwright smoke tests cover every public route, all three local articles, all seven agent details, the admin demonstration, health, robots, sitemap, custom 404 behavior, primary navigation, visible CTAs, runtime errors, one visible H1, and horizontal overflow at desktop and mobile sizes.

The axe suite checks the homepage, product page, services, pricing, blog listing, a blog article, contact page, a complete agent page, a legal page, and the admin demonstration. Serious and critical violations fail; no axe rules are disabled.

Continuous integration runs clean install, lint, TypeScript, unit tests, production build, Playwright, and a production dependency audit. It does not deploy the application.

## Known limitations and future milestones

- The AI Software Engineer and agents are a planned product model; no production AI execution exists.
- Product dashboards contain clearly labelled sample information only.
- Named integration products are examples, not working connectors or partnerships.
- No customer claims, measured outcomes, ratings, certifications, or compliance guarantees are represented.
- Pricing is indicative and no billing or checkout exists.
- There is no database, authentication, CMS, analytics, CRM, email delivery, or contact persistence.
- The admin dashboard remains a noindex static demonstration with no sensitive data or functionality.
- Legal drafts require qualified review and replacement before production launch.
- Chromium is the required E2E browser; Firefox and WebKit coverage remain future work.
- A future backend and deployment milestone should validate the contact workflow, hosting configuration, operational monitoring, security controls, and final production metadata before launch.
