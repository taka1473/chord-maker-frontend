import { forwardRef } from "react";

const variantStyles = {
  default: "rounded-lg border border-foreground/10",
  interactive:
    "rounded-lg border border-foreground/10 transition-colors hover:border-foreground/25 hover:bg-foreground/5",
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
