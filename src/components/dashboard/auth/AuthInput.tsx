"use client";

import React, { useId, useState, useEffect } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export function AuthInput({
  label,
  error,
  hint,
  icon,
  rightAdornment,
  className = "",
  id,
  required,
  placeholder,
  onFocus,
  onBlur,
  onChange,
  ...props
}: AuthInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const [isFocused, setIsFocused] = useState(false);
  const [internalVal, setInternalVal] = useState<string | number | readonly string[]>(
    props.value ?? props.defaultValue ?? ""
  );

  useEffect(() => {
    if (props.value !== undefined) {
      setInternalVal(props.value);
    }
  }, [props.value]);

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
  const isFloating = isFocused || hasValue;

  return (
    <div className="space-y-1 w-full text-left">
      {hint && (
        <div className="flex justify-end">
          <span id={hintId} className="text-[11px] text-[#647581]">
            {hint}
          </span>
        </div>
      )}

      <div className="relative w-full pt-1.5 rounded-2xl">
        {icon && (
          <div className="absolute left-3.5 top-[calc(50%+3px)] -translate-y-1/2 text-stone-400 pointer-events-none z-10">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={isFloating ? placeholder : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-white border transition-all duration-200 text-[#071a28] focus:outline-hidden shadow-none ${
            icon ? "pl-10" : "pl-3.5"
          } ${rightAdornment ? "pr-11" : "pr-3.5"} ${
            error
              ? "border-rose-500 focus:border-rose-500"
              : "border-[rgba(7,26,40,0.14)] focus:border-[#0088cc]"
          } ${className}`}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={`absolute transition-all duration-200 ease-out pointer-events-none select-none flex items-center leading-none ${
              isFloating
                ? "top-1.5 -translate-y-1/2 left-3 px-1.5 bg-white text-[11px] sm:text-xs font-bold z-10"
                : `top-[calc(50%+3px)] -translate-y-1/2 ${
                    icon ? "left-10" : "left-4"
                  } text-xs sm:text-sm font-normal text-stone-400`
            } ${
              isFloating
                ? isFocused
                  ? "text-[#0088cc]"
                  : error
                  ? "text-rose-600"
                  : "text-[#071a28]"
                : "text-stone-400"
            }`}
          >
            <span>{label}</span>
            {required && isFocused && (
              <span className="text-rose-500 ml-1 font-bold text-sm leading-none animate-in fade-in duration-200" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {rightAdornment && (
          <div className="absolute right-3.5 top-[calc(50%+3px)] -translate-y-1/2 flex items-center z-10">
            {rightAdornment}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-[11px] font-medium text-rose-600 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}

