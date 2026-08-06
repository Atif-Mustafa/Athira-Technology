import { AlertTriangle } from "lucide-react";
import { CallToAction } from "../../../components/marketing/CallToAction";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "Website Terms Draft",
  description: "Review the draft Athira Technology informational website terms. This content requires legal and commercial review before production use.",
  path: "/terms",
});

const sections = [
  {
    title: "Purpose of this website",
    paragraphs: [
      "This website presents Athira Technology's product direction, proposed SDLC agent model, educational content, and professional-service categories. It is informational and does not provide access to a production AI platform, customer account, paid subscription, or administrative system.",
    ],
  },
  {
    title: "Planned and illustrative capabilities",
    paragraphs: [
      "Product workflows, interface previews, integration examples, governance concepts, and agent responsibilities are planned or illustrative unless a page explicitly says otherwise. They are not commitments that a connector, control, model, hosting option, performance level, or certification is available.",
      "Displayed sample work items and statuses are fictional interface examples and are not customer results or production data.",
    ],
  },
  {
    title: "No online transaction or submission",
    paragraphs: [
      "The website does not implement checkout, payment processing, subscriptions, contract acceptance, or contact-form delivery. Pricing labels are indicative engagement structures only. Commercial scope, fees, responsibilities, and deliverables require a separately reviewed agreement.",
    ],
  },
  {
    title: "Educational content",
    paragraphs: [
      "Blog and product content provides general technical and product-design perspectives. It is not legal, security, compliance, financial, or professional advice for a particular system. Readers should evaluate decisions with qualified specialists and their own organizational requirements.",
    ],
  },
  {
    title: "Intellectual property and acceptable use",
    paragraphs: [
      "The final terms should identify the legal owner of website content, permitted reuse, trademarks, and procedures for reporting concerns. Until reviewed, this draft should not be relied on as a complete license or enforcement policy.",
      "Visitors should not attempt to disrupt the website, bypass technical restrictions, probe non-public systems, or submit malicious content. The current public form is disabled and must not be used for sensitive information.",
    ],
  },
  {
    title: "Availability and external examples",
    paragraphs: [
      "The website may change or be unavailable during development. References to third-party tools describe example integration categories and do not imply endorsement, partnership, or an operational connection.",
    ],
  },
  {
    title: "Liability, governing terms, and contact",
    paragraphs: [
      "Enforceable warranty disclaimers, liability limits, governing law, dispute terms, legal-entity details, and a formal notice address are not established by this draft. Those provisions require legal and commercial approval appropriate to the production operator and intended markets.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <StructuredData data={breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Website terms draft", path: "/terms" }])} />
      <PageHero
        eyebrow="Draft — legal review required"
        title="Informational website terms draft"
        description="These working terms explain the current website boundary. They are not legal advice, a final agreement, or approved production terms."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Website terms draft" }]}
      />
      <Section>
        <Container className="max-w-4xl">
          <div className="flex gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-amber-100">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm leading-6"><strong>Status:</strong> Working website content dated 6 August 2026. Legal counsel and the future contracting entity must review and replace this draft before production use.</p>
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
      <CallToAction title="Explore the product within its stated boundaries" description="The product pages distinguish planned workflows from implemented website functionality and keep human accountability explicit." primaryLabel="Explore the product model" primaryHref="/ai-software-engineer" secondaryLabel="Review privacy draft" secondaryHref="/privacy" />
    </>
  );
}
