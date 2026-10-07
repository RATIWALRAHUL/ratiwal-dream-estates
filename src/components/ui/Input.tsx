"use client";

import {
  InputHTMLAttributes,
  forwardRef,
  useId,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      required,
      placeholder,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [internalVal, setInternalVal] = useState<string | number | readonly string[]>(
      props.value ?? props.defaultValue ?? ""
    );

    // Sync external controlled value
    useEffect(() => {
      if (props.value !== undefined) {
        setInternalVal(props.value);
      }
    }, [props.value]);

    // Check DOM node on mount for autofill or uncontrolled defaultValue
    useEffect(() => {
      if (inputRef.current && inputRef.current.value !== "") {
        setInternalVal(inputRef.current.value);
      }
    }, []);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setInternalVal(e.target.value);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalVal(e.target.value);
      onChange?.(e);
    };

    const hasValue = internalVal !== "" && internalVal !== null && internalVal !== undefined;
    const isDateOrTime =
      type === "date" || type === "time" || type === "datetime-local" || type === "month";
    const isFloating = isFocused || hasValue || isDateOrTime;

    return (
      <div className="w-full flex flex-col space-y-1">
        <div className="relative w-full pt-1.5">
          <input
            ref={setRefs}
            id={id}
            type={type}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={isFloating ? placeholder : undefined}
            className={cn(
              "w-full min-h-[48px] rounded-xl border border-[1px] bg-white px-4 py-2.5 text-xs sm:text-sm text-[var(--midnight)] shadow-none transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
              error
                ? "border-red-500 focus:border-red-500"
                : isFocused
                ? "border-[#087fc3] focus:border-[#087fc3]"
                : "border-slate-300 hover:border-slate-400",
              props.disabled && "opacity-60 cursor-not-allowed bg-gray-50 border-[rgba(7,26,40,0.14)]",
              label && !isFloating && "placeholder:opacity-0",
              className
            )}
            style={{ outline: "none", boxShadow: "none" }}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />

          {label && (
            <label
              htmlFor={id}
              className={cn(
                "absolute transition-all duration-200 ease-out pointer-events-none select-none flex items-center leading-none",
                isFloating
                  ? "top-1.5 -translate-y-1/2 left-3 px-1.5 bg-white text-[11px] sm:text-xs font-bold z-10"
                  : "top-1/2 -translate-y-1/2 left-4 text-xs sm:text-sm font-normal text-[var(--text-secondary)]",
                isFloating
                  ? isFocused
                    ? "text-[var(--ratiwal-blue)]"
                    : error
                    ? "text-red-500"
                    : "text-[var(--midnight)]"
                  : "text-[var(--text-secondary)]"
              )}
            >
              <span>{label}</span>
              {required && isFocused && (
                <span
                  className="text-red-500 ml-1 font-bold text-sm leading-none animate-in fade-in duration-200"
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </label>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-500 mt-0.5" role="alert">
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

