import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

type ButtonStyleProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

function getButtonClassName({
  className,
  variant = "primary",
  size = "md",
}: ButtonStyleProps & { className?: string }) {
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

  return cn(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
    variants[variant],
    sizes[size],
    className,
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={getButtonClassName({ className, variant, size })}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export function ButtonLink({ className, variant = "primary", size = "md", ...props }: ButtonLinkProps) {
  return <Link className={getButtonClassName({ className, variant, size })} {...props} />;
}

export { Button };
