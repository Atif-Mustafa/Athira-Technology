import { AlertTriangle } from "lucide-react";
import { CallToAction } from "../../../components/marketing/CallToAction";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "Privacy Notice Draft",
  description: "Review the draft Athira Technology website privacy notice. This content requires legal and operational review before production use.",
  path: "/privacy",
});

const sections = [
  {
    title: "Current website behavior",
    paragraphs: [
      "This repository implements a public informational website and an email-delivered business-enquiry form. It does not include user accounts, analytics providers, advertising trackers, a contact database, a CMS, or production AI features.",
      "The contact form must not be used for passwords, source code, payment details, identity documents, health information, or other confidential, regulated, or sensitive information.",
    ],
  },
  {
    title: "Contact information submitted",
    paragraphs: [
      "The form collects a full name, work email, company name, area of interest, message, privacy acknowledgment, and optional project-stage and indicative-budget selections. A hidden honeypot field is used to identify basic automated submissions.",
      "The application uses this information only to deliver and respond to the business enquiry. It does not add the visitor to a marketing list and does not send an automatic marketing email.",
    ],
  },
  {
    title: "Technical request information",
    paragraphs: [
      "Vercel and network providers may process ordinary request information such as an IP address, user agent, requested path, timestamp, and diagnostic logs. For contact rate limiting, the server reads the Vercel-controlled client address, immediately converts it to a keyed one-way hash, and sends only that opaque identifier to the rate-limit service. The application does not log the raw address.",
      "Operational contact logs contain a timestamp, request identifier, outcome categories, validation and rate-limit state, provider acceptance category, and duration. They exclude names, complete email addresses, messages, raw IP addresses, API keys, recipient addresses, and provider payloads.",
    ],
  },
  {
    title: "Cookies, analytics, and profiling",
    paragraphs: [
      "The application code does not currently set analytics, advertising, preference, or authentication cookies. It does not implement visitor profiling or behavioral analytics. If those capabilities are introduced later, consent, configuration, retention, and disclosure requirements must be reviewed before launch.",
    ],
  },
  {
    title: "Email delivery and abuse controls",
    paragraphs: [
      "Accepted enquiries are sent through Resend to one configured Athira Technology recipient. The validated visitor email is used as the reply-to address, not as the sender. The application does not keep a database copy, but the configured recipient mailbox and Resend may retain delivery and message records under their settings and agreements.",
      "Upstash Redis provides distributed rate limiting for production. It receives a keyed hash rather than the raw client address. A small process-local limiter is permitted only for local development and automated tests and is not treated as production protection.",
    ],
  },
  {
    title: "Access, retention, and service providers",
    paragraphs: [
      "Access should be limited to approved Athira Technology personnel who handle business enquiries and to the service providers required for hosting, email delivery, and rate limiting. This draft does not confirm contractual roles, data-processing agreements, storage regions, or international-transfer mechanisms; those details require owner and legal review against the selected accounts and deployment region.",
      "Retention period requiring business approval: [PROJECT OWNER TO APPROVE MAILBOX, RESEND, UPSTASH, AND VERCEL RETENTION SETTINGS BEFORE LAUNCH]. No retention period is invented by this draft.",
    ],
  },
  {
    title: "Your choices and contact channel",
    paragraphs: [
      "The contact form includes an acknowledgment linking to this draft, but this page does not claim that acknowledgment establishes a particular legal basis or valid consent under any law. Applicable access, correction, deletion, objection, or complaint rights depend on the responsible legal entity, visitor location, and actual processing activity.",
      "A verified privacy-request address and response procedure must be approved before launch. Until then, the configured public contact channel is the only website contact path, and this draft must not be treated as a final rights procedure.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <StructuredData data={breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Privacy notice draft", path: "/privacy" }])} />
      <PageHero
        eyebrow="Draft — legal review required"
        title="Website privacy notice draft"
        description="This page documents the limited behavior present in the repository and flags decisions required before production. It is not legal advice or a legally approved notice."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy notice draft" }]}
      />
      <Section>
        <Container className="max-w-4xl">
          <div className="flex gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-amber-100">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm leading-6"><strong>Status:</strong> Working website content dated 6 August 2026. Legal counsel and the future production operator must review and replace this draft before launch.</p>
          </div>
          <div className="article-copy mt-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <div className="mt-5 space-y-5">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              </section>
            ))}
          </div>
        </Container>
      </Section>
      <CallToAction title="Have a question about the contact process?" description="The contact form validates and abuse-checks business enquiries before asking the configured email provider to deliver them. Do not submit sensitive information." primaryLabel="Review the contact form" secondaryLabel="Return to the product" secondaryHref="/ai-software-engineer" />
    </>
  );
}
