import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "outline";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        {
          "bg-primary-blue text-white": variant === "primary",
          "bg-primary-light text-primary-blue": variant === "secondary",
          "bg-success-color/10 text-success-color border border-success-color/20": variant === "success",
          "bg-warning-color/10 text-warning-color border border-warning-color/20": variant === "warning",
          "bg-error-color/10 text-error-color border border-error-color/20": variant === "error",
          "border border-border-color text-text-muted bg-transparent": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
