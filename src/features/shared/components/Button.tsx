import { forwardRef } from "react";
import Link from "next/link";

const variantStyles = {
  primary:
    "rounded bg-foreground text-background font-medium transition-opacity hover:opacity-90 disabled:opacity-50",
  secondary:
    "rounded border border-foreground/20 transition-colors hover:bg-foreground/5",
  destructive:
    "rounded border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20",
  ghost:
    "text-foreground/60 transition-colors hover:text-foreground",
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
