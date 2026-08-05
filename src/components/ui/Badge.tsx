import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border-blue-500/30 bg-blue-500/5 text-blue-400",
      success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      destructive: "border-red-500/30 bg-red-500/10 text-red-400",
      outline: "border-slate-700 text-slate-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
export { Badge };
