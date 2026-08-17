import { ArrowRight, CheckCircle2, MinusCircle } from "lucide-react";
import { CallToAction } from "../../../components/marketing/CallToAction";
import { FaqList } from "../../../components/marketing/FaqList";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { ButtonLink } from "../../../components/ui/Button";
import { pricingComparison, pricingFaqs, pricingPlans } from "../../../content/pricing";
import { breadcrumbStructuredData, createMetadata, faqStructuredData } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "Pricing and Engagement Options",
  description: "Review indicative Athira Technology discovery, prototype, and enterprise engagement options. Final pricing requires a custom scope and quote.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <StructuredData data={[faqStructuredData(pricingFaqs), breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])]} />
      <PageHero
        eyebrow="Indicative engagement options"
        title="Scope the right first step before setting the price"
        description="Final packages and rates have not been approved. These options show how discovery, prototype, and enterprise engagements may be structured; each requires a custom quote."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
        actions={<><ButtonLink href="/contact" size="lg">Request a scoped conversation <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></ButtonLink><ButtonLink href="/services" variant="outline" size="lg">Explore services</ButtonLink></>}
      />
      <Section aria-labelledby="plans-heading">
        <Container>
          <SectionHeading id="plans-heading" eyebrow="Packages" title="Three levels of engagement" description="No option on this page creates a subscription, checkout, or entitlement to production software." />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article key={plan.slug} className={`relative flex h-full flex-col rounded-3xl border p-7 ${plan.featured ? "border-blue-500/60 bg-blue-500/5" : "border-slate-800 bg-slate-950/50"}`}>
                {plan.featured ? <span className="absolute right-5 top-5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">Prototype pathway</span> : null}
                <p className="text-sm font-semibold text-blue-400">{plan.priceLabel}</p>
                <h2 className="mt-3 text-2xl font-bold text-white">{plan.name}</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-300">{plan.targetUser}</p>
                <p className="mt-5 leading-7 text-slate-400">{plan.description}</p>
                <h3 className="mt-7 font-semibold text-white">Included scope</h3>
                <ul className="mt-4 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-slate-300"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />{feature}</li>)}</ul>
                <h3 className="mt-7 font-semibold text-white">Boundaries</h3>
                <ul className="mt-4 space-y-3">{plan.limitations.map((item) => <li key={item} className="flex gap-3 text-sm text-slate-400"><MinusCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />{item}</li>)}</ul>
                <ButtonLink href="/contact" variant={plan.featured ? "primary" : "outline"} className="mt-8 w-full">{plan.cta}</ButtonLink>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="subtle" aria-labelledby="comparison-heading">
        <Container>
          <SectionHeading id="comparison-heading" eyebrow="Comparison" title="Compare the intended depth of each package" description="Actual scope depends on systems, data access, risk, availability, and agreed deliverables." />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">Comparison of Starter, Growth, and Enterprise engagement options</caption>
              <thead className="bg-slate-900"><tr><th scope="col" className="px-5 py-4 font-semibold text-white">Capability</th>{pricingPlans.map((plan) => <th key={plan.slug} scope="col" className="px-5 py-4 font-semibold text-white">{plan.name}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/60">{pricingComparison.map((row) => <tr key={row.feature}><th scope="row" className="px-5 py-4 font-medium text-slate-200">{row.feature}</th><td className="px-5 py-4 text-slate-400">{row.starter}</td><td className="px-5 py-4 text-slate-400">{row.growth}</td><td className="px-5 py-4 text-slate-400">{row.enterprise}</td></tr>)}</tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="faq-heading">
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading id="faq-heading" eyebrow="Pricing FAQ" title="Commercial questions, answered plainly" />
          <FaqList faqs={pricingFaqs} />
        </Container>
      </Section>
      <CallToAction title="Get a quote based on real scope" description="Tell us which workflow, systems, reviewers, and constraints are involved. The secure contact workflow validates and email-delivers accepted business enquiries without application database storage." primaryLabel="Start an enquiry" secondaryLabel="Explore services" secondaryHref="/services" />
    </>
  );
}
