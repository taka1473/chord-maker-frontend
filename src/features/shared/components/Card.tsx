import { forwardRef } from "react";

const variantStyles = {
  default: "rounded-lg border border-border bg-surface",
  interactive:
    "rounded-lg border border-border bg-surface transition-colors hover:border-primary/30 hover:bg-primary/5",
} as const;

type CardProps = {
  variant?: keyof typeof variantStyles;
} & React.HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ variant = "default", className = "", ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);
