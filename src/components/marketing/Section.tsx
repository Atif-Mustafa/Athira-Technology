import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: "default" | "subtle";
};

export function Section({
  children,
  className,
  tone = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-20 sm:py-24",
        tone === "subtle" && "border-y border-slate-800/70 bg-slate-900/30",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
