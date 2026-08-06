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
      "This repository implements a public informational website. It does not include user accounts, analytics providers, advertising trackers, a database, a CMS, contact-form delivery, or production AI features.",
      "The demonstration contact form is intentionally disabled. Information typed into it is not submitted by the application. Visitors should not enter confidential, regulated, or sensitive information.",
    ],
  },
  {
    title: "Technical request information",
    paragraphs: [
      "A hosting, network, or security provider may process ordinary technical request information such as an IP address, user agent, requested path, timestamp, and diagnostic logs when the website is deployed. This repository does not select a production host or define its retention settings. The final notice must be updated to match the actual deployment and provider agreements.",
    ],
  },
  {
    title: "Cookies, analytics, and profiling",
    paragraphs: [
      "The application code does not currently set analytics, advertising, preference, or authentication cookies. It does not implement visitor profiling or behavioral analytics. If those capabilities are introduced later, consent, configuration, retention, and disclosure requirements must be reviewed before launch.",
    ],
  },
  {
    title: "Future contact handling",
    paragraphs: [
      "A future milestone may connect the contact form to a secure server-side delivery process. Before that happens, Athira Technology must define the responsible organization, legal basis or business purpose, required fields, validation, recipients, retention period, deletion process, access controls, and any service providers.",
      "The enabled form should collect only the minimum information needed for a business inquiry and must not request passwords, source code, government identifiers, health data, financial account information, or other unnecessary sensitive data.",
    ],
  },
  {
    title: "Data sharing and international handling",
    paragraphs: [
      "This draft does not claim that contact data, analytics data, or AI workflow data is currently shared or transferred because those systems are not implemented here. The final notice must identify actual processors, locations, and transfer mechanisms after the production architecture is approved.",
    ],
  },
  {
    title: "Your choices and contact channel",
    paragraphs: [
      "No privacy-request channel is configured by this repository. A verified contact address and response process must be established before this notice can become final. Applicable access, correction, deletion, objection, or complaint rights depend on the organization, visitor location, and actual processing activity and require legal review.",
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
      <CallToAction title="Have a question about the planned website process?" description="The current contact form is a static demonstration and does not transmit information. Review it to understand the proposed fields and future handling boundary." primaryLabel="Review contact status" secondaryLabel="Return to the product" secondaryHref="/ai-software-engineer" />
    </>
  );
}
