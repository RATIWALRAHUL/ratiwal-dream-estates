"use client";

import React, { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits.map((d) => (d === " " ? "" : d))];
    newDigits[index] = char;
    const combined = newDigits.join("");
    onChange(combined);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
      {Array.from({ length }).map((_, index) => {
        const char = digits[index]?.trim() || "";
        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            disabled={disabled}
            value={char}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={`w-11 h-13 sm:w-13 sm:h-15 text-center font-mono text-xl sm:text-2xl font-bold rounded-2xl border transition-all duration-150 text-[#071a28] bg-[#fcfbf9] focus:bg-white focus:outline-hidden ${
              error
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                : char
                ? "border-[#0088cc] bg-white ring-1 ring-[#0088cc]/20 shadow-xs"
                : "border-[rgba(7,26,40,0.12)] focus:border-[#0088cc] focus:ring-2 focus:ring-[#0088cc]/20"
            }`}
          />
        );
      })}
    </div>
  );
}
