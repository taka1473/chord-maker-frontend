import { forwardRef } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className = "", ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`w-full rounded border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none ${className}`}
        {...props}
      />
    );
  }
);
