import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LogoLoader } from "@/components/ui/LogoLoader";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-primary-blue text-white hover:bg-primary-dark": variant === "primary",
            "bg-primary-light text-primary-blue hover:bg-primary-blue hover:text-white": variant === "secondary",
            "border border-primary-blue text-primary-blue bg-transparent hover:bg-primary-light": variant === "outline",
            "text-text-main hover:bg-gray-100": variant === "ghost",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2.5 text-sm": size === "md",
            "px-6 py-3.5 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <LogoLoader variant="button" className="mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
