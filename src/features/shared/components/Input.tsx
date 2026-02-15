import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none ${className}`}
        {...props}
      />
    );
  }
);
