import Link from "next/link";
import { Mail } from "lucide-react";
import { ContactForm } from "../../../components/forms/ContactForm";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { siteConfig } from "../../../config/site";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "Contact",
  description: "Contact Athira Technology to discuss AI product strategy, SDLC agent concepts, software-delivery automation, or engineering services.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <StructuredData data={breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageHero
        eyebrow="Discovery contact"
        title="Tell us which workflow or engineering problem you are evaluating"
        description="Share the minimum context needed for a business conversation. Accepted enquiries are validated, abuse-checked, and delivered to Athira Technology by email without application database storage."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Section aria-labelledby="contact-form-heading">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionHeading id="contact-form-heading" eyebrow="Secure enquiry" title="Start with the problem and decision you need to make" description="Required fields are marked with an asterisk. Server validation remains authoritative even when browser validation succeeds." />
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
          <aside className="space-y-6" aria-labelledby="next-steps-heading">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-7">
              <h2 id="next-steps-heading" className="text-xl font-semibold text-white">Expected next steps</h2>
              <ol className="mt-6 space-y-5">
                {["Confirm the business and engineering problem.", "Identify workflow boundaries, reviewers, and systems.", "Define a proportionate discovery, assessment, or pilot.", "Provide scope and commercial terms for review."].map((step, index) => <li key={step} className="flex gap-4"><span className="font-semibold text-blue-400">0{index + 1}</span><p className="text-sm leading-6 text-slate-300">{step}</p></li>)}
              </ol>
              <p className="mt-6 text-sm leading-6 text-slate-400">No exact response time is promised. Delivery confirms that the configured provider accepted the enquiry, not that a team member has reviewed it.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-7">
              <Mail aria-hidden="true" className="h-6 w-6 text-blue-400" />
              <h2 className="mt-4 text-xl font-semibold text-white">Alternative contact</h2>
              {siteConfig.contactEmail ? (
                <p className="mt-3 text-sm leading-6 text-slate-400">Use the configured public address: <a className="font-semibold text-blue-300 hover:text-blue-200" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">A public alternative email has not been configured. If the form reports an outage, retain the request reference and try again later.</p>
              )}
              <Link href="/services" className="mt-5 inline-flex rounded-sm text-sm font-semibold text-slate-200 hover:text-blue-300">Review service options</Link>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
