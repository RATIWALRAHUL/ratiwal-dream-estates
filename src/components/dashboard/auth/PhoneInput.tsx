"use client";

import React, { useId } from "react";
import { Phone } from "lucide-react";

interface PhoneInputProps {
  label?: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  error?: string;
  required?: boolean;
}

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)", flag: "🇮🇳" },
  { code: "+971", label: "UAE (+971)", flag: "🇦🇪" },
  { code: "+44", label: "UK (+44)", flag: "🇬🇧" },
  { code: "+1", label: "USA (+1)", flag: "🇺🇸" },
];

export function PhoneInput({
  label = "Mobile Number",
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  error,
  required = true,
}: PhoneInputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5 w-full text-left">
      <label htmlFor={id} className="block text-xs font-bold text-[#071a28]">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="flex rounded-2xl border border-[rgba(7,26,40,0.12)] bg-[#fcfbf9] overflow-hidden focus-within:border-[#0088cc] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0088cc]/20 transition-all">
        {/* Country Code Select */}
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          aria-label="Country calling code"
          className="bg-stone-100/70 border-r border-[rgba(7,26,40,0.1)] px-2.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#071a28] focus:outline-hidden cursor-pointer"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>

        {/* Phone Input */}
        <div className="relative flex-1">
          <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            id={id}
            type="tel"
            required={required}
            value={phone}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9\s\-]/g, "");
              onPhoneChange(cleaned);
            }}
            placeholder="98290 12345"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-transparent border-0 text-[#071a28] placeholder-stone-400 focus:outline-hidden"
          />
        </div>
      </div>

      {error && (
        <p id={errorId} className="text-[11px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
