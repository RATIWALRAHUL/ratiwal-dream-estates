import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-main flex items-center">
            {label}
            {props.required && <span className="text-error-color ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            "w-full min-h-[48px] rounded border border-border-color bg-white px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-blue",
            error ? "border-error-color focus-visible:ring-error-color" : "hover:border-gray-400",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : (helperText ? helperId : undefined)}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-xs font-medium text-error-color" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
