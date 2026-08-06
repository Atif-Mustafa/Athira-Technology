import { ArrowRight } from "lucide-react";
import { ButtonLink } from "../ui/Button";
import { Container, Section } from "./Section";

type CallToActionProps = {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function CallToAction({
  title = "Define a responsible first workflow",
  description = "Start with the engineering problem, review points, and data constraints. We can help frame a practical discovery or pilot without overstating what is ready today.",
  primaryLabel = "Start a discovery conversation",
  primaryHref = "/contact",
  secondaryLabel = "Explore the product model",
  secondaryHref = "/ai-software-engineer",
}: CallToActionProps) {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-blue-500/10 px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.2),transparent_45%)]" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
            <p className="mt-4 leading-7 text-slate-300">{description}</p>
          </div>
          <div className="relative mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
            <ButtonLink href={primaryHref} size="lg">
              {primaryLabel} <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={secondaryHref} variant="outline" size="lg">
              {secondaryLabel}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
