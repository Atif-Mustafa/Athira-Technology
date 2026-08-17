import type { ReactNode } from "react";
import { Badge } from "../ui/Badge";
import { Breadcrumbs } from "./Breadcrumbs";
import { Container } from "./Section";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs?: readonly { label: string; href?: string }[];
  actions?: ReactNode;
  aside?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  aside,
}: PageHeroProps) {
  return (
    <header className="relative overflow-hidden border-b border-slate-800/70 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.14),transparent_42%)]"
      />
      <Container className="relative">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        <div className={aside ? "grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]" : "max-w-4xl"}>
          <div>
            <Badge className="mb-6 uppercase tracking-[0.18em]">{eyebrow}</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {description}
            </p>
            {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      </Container>
    </header>
  );
}
