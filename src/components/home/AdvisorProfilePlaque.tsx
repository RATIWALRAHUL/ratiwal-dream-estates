import React from "react";

interface AdvisorProfilePlaqueProps {
  role?: string;
  availability?: string;
  className?: string;
}

export function AdvisorProfilePlaque({
  role = "Senior Property Advisor",
  availability = "Available for private consultations",
  className = "",
}: AdvisorProfilePlaqueProps) {
  return (
    <div
      className={`bg-[var(--advisor-ivory)] border border-[var(--advisor-border)] rounded-md p-3.5 sm:p-4 shadow-[0_12px_28px_rgba(6,30,46,0.08)] max-w-xs w-full transition-transform duration-500 hover:shadow-[0_16px_34px_rgba(6,30,46,0.12)] ${className}`}
    >
      <h3 className="font-instrument text-[18px] sm:text-[21px] text-[var(--advisor-midnight)] font-normal leading-tight tracking-tight">
        {role}
      </h3>
      <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
        <span
          className="relative flex h-2 w-2 flex-shrink-0"
          aria-hidden="true"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--advisor-green)] opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--advisor-green)]" />
        </span>
        <span className="text-[12px] sm:text-[13px] text-[var(--advisor-graphite)] font-medium leading-none">
          {availability}
        </span>
      </div>
    </div>
  );
}
