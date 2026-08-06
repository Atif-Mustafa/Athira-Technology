import { ChevronDown } from "lucide-react";
import type { FaqItem } from "../../content/shared";

export function FaqList({ faqs }: { faqs: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
      {faqs.map((faq) => (
        <details key={faq.question} className="group px-5 py-1 sm:px-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-semibold text-white marker:hidden">
            <span>{faq.question}</span>
            <ChevronDown
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-blue-400 transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="max-w-3xl pb-6 leading-7 text-slate-400">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
