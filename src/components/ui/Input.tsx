import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, required, ...props }, ref) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-xs sm:text-[13px] font-bold text-[var(--midnight)] flex items-center">
            {label}
            {required && <span className="text-red-500 ml-1 font-bold" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          required={required}
          className={cn(
            "w-full min-h-[48px] rounded-xl border border-[rgba(7,26,40,0.12)] bg-white px-4 py-2.5 text-xs sm:text-sm text-[var(--midnight)] placeholder:text-[var(--text-secondary)] shadow-xs transition-all duration-200 focus:outline-none focus:border-[var(--ratwal-blue)] focus:ring-2 focus:ring-[rgba(8,127,195,0.18)] hover:border-[rgba(8,127,195,0.4)]",
            error ? "border-red-400 focus:ring-red-400/20" : "",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : (helperText ? helperId : undefined)}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-500 mt-1" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[var(--text-secondary)] mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
