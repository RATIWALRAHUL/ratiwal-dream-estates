import { Property } from "@/types/property";
import { PropertyCard } from "./PropertyCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface PropertyGridProps {
  properties: Property[];
  onResetFilters?: () => void;
}

export function PropertyGrid({ properties, onResetFilters }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <EmptyState
        title="No Properties Found"
        description="No plots currently match your filters. Please adjust your criteria or reset the search."
        actionLabel={onResetFilters ? "Reset Search Filters" : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      {properties.map((property) => (
        <div key={property.id} className="h-full">
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
}
