import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  description,
  centered = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-3 mb-10",
        centered ? "mx-auto text-center items-center max-w-2xl" : "max-w-3xl",
        className
      )}
    >
      {subtitle && (
        <span className="text-label text-primary-blue font-semibold tracking-wider block">
          {subtitle}
        </span>
      )}
      <h2 className="text-h2 text-primary-dark font-heading font-bold">
        {title}
      </h2>
      {description && (
        <p className="text-body text-text-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
