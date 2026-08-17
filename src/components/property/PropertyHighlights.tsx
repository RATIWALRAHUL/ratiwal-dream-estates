import { Check } from "lucide-react";
import { Property } from "@/types/property";
import { Badge } from "@/components/ui/Badge";

interface PropertyHighlightsProps {
  property: Property;
}

export function PropertyHighlights({ property }: PropertyHighlightsProps) {
  return (
    <div className="space-y-8">
      {/* Parameter Overview Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-neutral-bg border border-border-color rounded">
        <div>
          <span className="text-xs text-text-muted block mb-1">Type</span>
          <span className="text-sm font-semibold text-primary-dark">{property.propertyType}</span>
        </div>
        <div>
          <span className="text-xs text-text-muted block mb-1">Location</span>
          <span className="text-sm font-semibold text-primary-dark">{property.location}</span>
        </div>
        <div>
          <span className="text-xs text-text-muted block mb-1">City</span>
          <span className="text-sm font-semibold text-primary-dark">{property.city}</span>
        </div>
        <div>
          <span className="text-xs text-text-muted block mb-1">Status</span>
          <span className="text-sm font-semibold text-primary-dark">{property.status}</span>
        </div>
      </div>

      {/* Highlights List */}
      <div>
        <h3 className="font-heading font-semibold text-base text-primary-dark mb-3">
          Key Highlights
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-main" aria-label="Key highlights">
          {property.highlights.map((highlight, index) => (
            <li key={index} className="flex items-center space-x-2.5">
              <Check className="h-4 w-4 text-primary-blue flex-shrink-0" aria-hidden="true" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Connectivity & Nearby Landmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-heading font-semibold text-base text-primary-dark mb-3">
            Connectivity
          </h3>
          <ul className="space-y-2 text-sm text-text-main" aria-label="Connectivity points">
            {property.connectivity.map((conn, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-blue mt-2 flex-shrink-0" aria-hidden="true" />
                <span>{conn}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-heading font-semibold text-base text-primary-dark mb-3">
            Nearby Landmarks
          </h3>
          <ul className="space-y-2 text-sm text-text-main" aria-label="Nearby landmarks">
            {property.nearbyLandmarks.map((landmark, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-blue mt-2 flex-shrink-0" aria-hidden="true" />
                <span>{landmark}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Regulatory Approvals Verification Panel */}
      <div className="p-5 border border-border-color rounded bg-white">
        <h3 className="font-heading font-semibold text-base text-primary-dark mb-2">
          Regulatory Verification
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-3 sm:space-y-0 mt-3">
          <div>
            <span className="text-xs text-text-muted block mb-1">Authority Approval</span>
            <Badge variant="outline">{property.approvalAuthority || "[CONTENT REQUIRED]"}</Badge>
          </div>
          <div>
            <span className="text-xs text-text-muted block mb-1">Details & RERA / Registry Info</span>
            <span className="text-sm font-medium text-text-main">
              {property.approvalDetails || "[CONTENT REQUIRED]"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
