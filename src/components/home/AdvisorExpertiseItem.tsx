import React from "react";

interface AdvisorExpertiseItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  hasSeparator?: boolean;
}

export function AdvisorExpertiseItem({
  icon,
  title,
  description,
  hasSeparator = true,
}: AdvisorExpertiseItemProps) {
  return (
    <div
      className={`group flex items-start gap-3.5 sm:gap-4 py-2 sm:py-2.5 transition-colors duration-300 ${
        hasSeparator ? "border-b border-[var(--advisor-border)]" : ""
      }`}
    >
      <div
        className="flex-shrink-0 w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center text-[var(--advisor-cyan)] group-hover:text-[var(--advisor-blue)] group-hover:translate-x-0.5 transition-all duration-300 mt-0.5"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] sm:text-[15px] font-semibold text-[var(--advisor-midnight)] group-hover:text-[var(--advisor-blue)] transition-colors duration-300 leading-snug tracking-tight">
          {title}
        </h3>
        <p className="text-[12.5px] sm:text-[13.5px] text-[var(--advisor-graphite)] mt-0.5 leading-normal font-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
