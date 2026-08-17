import { Badge } from "@/components/ui/Badge";

export interface PlaceholderContentProps {
  sectionName: string;
}

export function PlaceholderContent({ sectionName }: PlaceholderContentProps) {
  return (
    <div className="border border-red-200 bg-red-50/20 rounded p-6 my-4 text-left">
      <div className="flex items-center space-x-2 mb-3">
        <Badge variant="error">DEVELOPMENT PLACEHOLDER</Badge>
        <span className="text-xs text-error-color font-medium">REPLACE BEFORE PRODUCTION</span>
      </div>
      <h4 className="font-heading font-semibold text-base text-primary-dark mb-1">
        {sectionName} Content Section
      </h4>
      <p className="text-xs text-text-muted">
        This is a layout placeholder for `{sectionName}`. Real copy, images, and brand data are pending client verification. Do not release this section to production.
      </p>
    </div>
  );
}
