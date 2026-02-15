import { forwardRef } from "react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  function Label({ className = "", ...props }, ref) {
    return (
      <label
        ref={ref}
        className={`mb-1 block text-sm font-medium ${className}`}
        {...props}
      />
    );
  }
);
