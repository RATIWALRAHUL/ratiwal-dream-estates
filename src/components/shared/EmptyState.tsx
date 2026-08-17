import { Button } from "@/components/ui/Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-color rounded bg-neutral-bg my-8">
      <h3 className="font-heading font-semibold text-lg text-primary-dark mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
