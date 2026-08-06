import Link from "next/link";
import { Mail, ShieldAlert } from "lucide-react";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { Button } from "../../../components/ui/Button";
import { siteConfig } from "../../../config/site";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "Contact",
  description: "Contact Athira Technology to discuss AI product strategy, SDLC agent concepts, software-delivery automation, or engineering services.",
  path: "/contact",
});

const inputClassName = "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none";

export default function ContactPage() {
  return (
    <>
      <StructuredData data={breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageHero
        eyebrow="Discovery contact"
        title="Tell us which workflow or engineering problem you are evaluating"
        description="This milestone presents a static contact experience. Form delivery, email, CRM, storage, and automated follow-up are not connected, so the form cannot yet be submitted."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Section aria-labelledby="contact-form-heading">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionHeading id="contact-form-heading" eyebrow="Demonstration form" title="Prepare the context for a future conversation" description="You can review the fields and tab through them, but submission is intentionally disabled until a secure delivery backend and privacy process are implemented." />
            <div id="form-status" className="mt-6 flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm leading-6 text-amber-100">
              <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <p><strong>Nothing entered here is transmitted.</strong> Do not enter passwords, secrets, personal records, source code, or other sensitive information.</p>
            </div>
            <form className="mt-8 grid gap-6 sm:grid-cols-2" aria-describedby="form-status">
              <div className="sm:col-span-2">
                <label htmlFor="interest" className="font-medium text-slate-200">Product or service interest</label>
                <select id="interest" name="interest" className={inputClassName} defaultValue="">
                  <option value="" disabled>Select an area</option>
                  <option>AI Software Engineer product discovery</option>
                  <option>SDLC agent workflow</option>
                  <option>AI product strategy</option>
                  <option>Software engineering services</option>
                  <option>Enterprise integration or modernization</option>
                </select>
              </div>
              <div>
                <label htmlFor="name" className="font-medium text-slate-200">Name</label>
                <input id="name" name="name" type="text" autoComplete="name" className={inputClassName} placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="font-medium text-slate-200">Work email</label>
                <input id="email" name="email" type="email" autoComplete="email" aria-describedby="email-description" className={inputClassName} placeholder="name@company.com" />
                <p id="email-description" className="mt-2 text-xs leading-5 text-slate-400">Use a business address when delivery is enabled in a future milestone.</p>
              </div>
              <div>
                <label htmlFor="company" className="font-medium text-slate-200">Company</label>
                <input id="company" name="company" type="text" autoComplete="organization" className={inputClassName} placeholder="Organization name" />
              </div>
              <div>
                <label htmlFor="stage" className="font-medium text-slate-200">Project stage <span className="text-slate-400">(optional)</span></label>
                <select id="stage" name="stage" className={inputClassName} defaultValue="">
                  <option value="">Select a stage</option>
                  <option>Exploring the problem</option>
                  <option>Defining a pilot</option>
                  <option>Reviewing architecture</option>
                  <option>Planning implementation</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="budget" className="font-medium text-slate-200">Indicative project budget <span className="text-slate-400">(optional)</span></label>
                <select id="budget" name="budget" className={inputClassName} defaultValue="">
                  <option value="">Prefer to discuss after discovery</option>
                  <option>Discovery or advisory engagement</option>
                  <option>Prototype implementation</option>
                  <option>Enterprise programme</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="font-medium text-slate-200">What problem are you trying to solve?</label>
                <textarea id="message" name="message" rows={6} aria-describedby="message-description" className={inputClassName} placeholder="Describe the workflow, current friction, and the decision you need to make." />
                <p id="message-description" className="mt-2 text-xs leading-5 text-slate-400">Do not include confidential, regulated, or sensitive information.</p>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled aria-describedby="submit-description">Submission not connected</Button>
                <p id="submit-description" className="mt-3 text-sm text-slate-400">A secure server endpoint, validation policy, delivery process, and final privacy notice are required before submission can be enabled.</p>
              </div>
            </form>
          </div>
          <aside className="space-y-6" aria-labelledby="next-steps-heading">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-7">
              <h2 id="next-steps-heading" className="text-xl font-semibold text-white">Expected next steps</h2>
              <ol className="mt-6 space-y-5">
                {["Confirm the business and engineering problem.", "Identify workflow boundaries, reviewers, and systems.", "Define a proportionate discovery, assessment, or pilot.", "Provide scope and commercial terms for review."].map((step, index) => <li key={step} className="flex gap-4"><span className="font-semibold text-blue-400">0{index + 1}</span><p className="text-sm leading-6 text-slate-300">{step}</p></li>)}
              </ol>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-7">
              <Mail aria-hidden="true" className="h-6 w-6 text-blue-400" />
              <h2 className="mt-4 text-xl font-semibold text-white">Alternative contact</h2>
              {siteConfig.contactEmail ? (
                <p className="mt-3 text-sm leading-6 text-slate-400">Use the configured public address: <a className="font-semibold text-blue-300 hover:text-blue-200" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">A public contact email has not yet been configured. Add <code className="text-slate-300">NEXT_PUBLIC_CONTACT_EMAIL</code> at deployment after the mailbox and handling process are approved.</p>
              )}
              <Link href="/services" className="mt-5 inline-flex rounded-sm text-sm font-semibold text-slate-200 hover:text-blue-300">Review service options</Link>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
