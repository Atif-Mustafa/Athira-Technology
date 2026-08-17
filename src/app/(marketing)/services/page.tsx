import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CallToAction } from "../../../components/marketing/CallToAction";
import { MarketingIcon } from "../../../components/marketing/MarketingIcon";
import { PageHero } from "../../../components/marketing/PageHero";
import { Container, Section, SectionHeading } from "../../../components/marketing/Section";
import { StructuredData } from "../../../components/seo/StructuredData";
import { ButtonLink } from "../../../components/ui/Button";
import { services } from "../../../content/services";
import { breadcrumbStructuredData, createMetadata } from "../../../lib/seo";

export const metadata = createMetadata({
  title: "AI and Software Engineering Services",
  description: "Explore Athira Technology services for AI product strategy, custom agents, delivery automation, enterprise integration, modernization, cloud, and quality engineering.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <StructuredData data={breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
      <PageHero
        eyebrow="Product and engineering services"
        title="Turn responsible AI and software-delivery ideas into a practical path"
        description="Athira Technology supports strategy, architecture, implementation planning, quality, and delivery enablement. Engagements are scoped around your actual workflow and constraints—not guaranteed outcomes."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        actions={<><ButtonLink href="/contact" size="lg">Discuss your initiative <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></ButtonLink><ButtonLink href="/pricing" variant="outline" size="lg">View engagement options</ButtonLink></>}
      />
      <Section aria-labelledby="services-heading">
        <Container>
          <SectionHeading id="services-heading" eyebrow="Capabilities" title="Choose the problem to solve, then shape the engagement" description="Each service begins with a defined business problem and ends with explicit deliverables and next decisions." />
          <div className="mt-12 space-y-6">
            {services.map((service, index) => (
              <article key={service.slug} id={service.slug} className="scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-950/50 p-6 sm:p-8">
                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-blue-400"><MarketingIcon icon={service.icon} className="h-6 w-6" /></span><span className="text-sm font-semibold text-slate-400">0{index + 1}</span></div>
                    <h2 className="mt-6 text-2xl font-bold text-white">{service.name}</h2>
                    <p className="mt-3 leading-7 text-slate-300">{service.summary}</p>
                    <ButtonLink href="/contact" variant="outline" size="sm" className="mt-6">Discuss this service</ButtonLink>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div><h3 className="font-semibold text-white">Business problem</h3><p className="mt-3 text-sm leading-6 text-slate-400">{service.businessProblem}</p></div>
                    <div><h3 className="font-semibold text-white">Typical scope</h3><p className="mt-3 text-sm leading-6 text-slate-400">{service.scope}</p></div>
                    <div><h3 className="font-semibold text-white">Likely deliverables</h3><ul className="mt-3 space-y-2">{service.deliverables.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-400"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />{item}</li>)}</ul></div>
                    <div><h3 className="font-semibold text-white">Engagement model</h3><p className="mt-3 text-sm leading-6 text-slate-400">{service.engagementModel}</p></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <CallToAction title="Start with a clearly bounded engineering outcome" description="A discovery conversation can establish the problem, evidence of success, constraints, dependencies, and a proportionate first engagement." primaryLabel="Discuss your requirements" secondaryLabel="Review indicative packages" secondaryHref="/pricing" />
    </>
  );
}
