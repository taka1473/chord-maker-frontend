import { forwardRef } from "react";
import Link from "next/link";

const variantStyles = {
  primary:
    "rounded bg-primary text-primary-foreground font-medium transition-opacity hover:opacity-90 disabled:opacity-50",
  secondary:
    "rounded border border-border transition-colors hover:bg-primary/5",
  destructive:
    "rounded border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10",
  ghost:
    "text-muted transition-colors hover:text-foreground",
} as const;

const sizeStyles = {
  default: "px-4 py-2 text-sm",
  sm: "px-3 py-1 text-xs",
} as const;

type ButtonProps = {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", size = "default", className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

type ButtonLinkProps = {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function ButtonLink({
  variant = "primary",
  size = "default",
  href,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
}
