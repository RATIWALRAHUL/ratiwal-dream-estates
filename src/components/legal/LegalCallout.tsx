import React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ExternalLink, Info, ShieldCheck } from "lucide-react";
import { LegalCalloutData } from "@/types/legal";
import { cn } from "@/lib/utils";

interface LegalCalloutProps {
  data: LegalCalloutData;
  className?: string;
}

export function LegalCallout({ data, className }: LegalCalloutProps) {
  const getIcon = () => {
    switch (data.type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />;
      case "rera":
        return <ShieldCheck className="w-4 h-4 text-[var(--ratwal-blue)] flex-shrink-0 mt-0.5" />;
      case "note":
        return <Info className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0 mt-0.5" />;
      case "info":
      default:
        return <AlertCircle className="w-4 h-4 text-[var(--ratwal-blue)] flex-shrink-0 mt-0.5" />;
    }
  };

  const getStyle = () => {
    switch (data.type) {
      case "warning":
        return "bg-amber-50/70 border-amber-200/80 text-amber-900";
      case "rera":
        return "bg-[var(--mist-blue)]/60 border-[var(--cyan)]/40 text-[var(--midnight)]";
      case "note":
        return "bg-[var(--surface)] border-[rgba(7,26,40,0.1)] text-[var(--midnight)]";
      case "info":
      default:
        return "bg-sky-50/60 border-sky-200/80 text-[var(--midnight)]";
    }
  };

  return (
    <div
      className={cn(
        "my-5 p-4 sm:p-5 rounded-xl border text-xs sm:text-[13px] leading-relaxed transition-all",
        getStyle(),
        className
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          {data.title && (
            <h4 className="font-bold text-xs uppercase tracking-wider mb-1 text-[var(--midnight)]">
              {data.title}
            </h4>
          )}
          <p className="opacity-90">{data.text}</p>
          {data.link && (
            <div className="mt-2.5">
              <a
                href={data.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-xs text-[var(--ratwal-blue)] hover:text-[var(--ratwal-blue-deep)] transition-colors underline decoration-dotted"
              >
                <span>{data.link.label}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
