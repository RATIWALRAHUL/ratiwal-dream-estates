import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article" | "main" | "header" | "footer";
}

export function Container({ className, as: Component = "div", ...props }: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full max-w-container mx-auto px-3 sm:px-4 lg:px-6",
        className
      )}
      {...props}
    />
  );
}
