import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 border border-transparent",
      secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-transparent",
      outline: "border border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800",
      ghost: "text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
      icon: "p-2",
    };

    const Comp = asChild ? "div" : "button";

    return (
      <Comp
        ref={ref as any}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props as any}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
