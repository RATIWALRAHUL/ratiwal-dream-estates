"use client";

import { useState } from "react";
import { MessageCircle, Calendar, Send } from "lucide-react";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SiteVisitForm } from "@/components/forms/SiteVisitForm";

interface PropertyEnquiryProps {
  property: Property;
}

export function PropertyEnquiry({ property }: PropertyEnquiryProps) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isVisitOpen, setIsVisitOpen] = useState(false);

  const whatsappUrl = generateWhatsAppUrl({
    type: "property",
    propertyName: property.name,
    locationName: `${property.location}, ${property.city}`,
  });

  return (
    <>
      <Card className="sticky top-24 border border-border-color shadow-md">
        <CardHeader className="bg-primary-light/20 border-b border-gray-100 p-5">
          <span className="text-xs text-text-muted block">Pricing Model</span>
          <CardTitle className="text-2xl text-primary-dark font-bold mt-1">
            {property.priceLabel}
          </CardTitle>
          <CardDescription className="text-xs text-text-muted mt-1.5">
            Contact us for available plot segments, site visits, and layout documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* WhatsApp Direct enquiry */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full focus-visible:outline"
            aria-label={`Instant WhatsApp inquiry for ${property.name}`}
          >
            <Button
              className="w-full bg-[#25D366] hover:bg-[#128C7E] border-none text-white flex items-center justify-center space-x-2 focus-visible:outline"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <span>Instant WhatsApp Inquiry</span>
            </Button>
          </a>

          <div className="border-t border-gray-100 my-2 pt-2" />

          {/* Form enquiry dialog trigger */}
          <Button
            onClick={() => setIsEnquiryOpen(true)}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 focus-visible:outline"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>Send Enquiry Email</span>
          </Button>

          {/* Site Visit scheduler trigger */}
          <Button
            onClick={() => setIsVisitOpen(true)}
            variant="secondary"
            className="w-full flex items-center justify-center space-x-2 focus-visible:outline"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Schedule Site Visit</span>
          </Button>
        </CardContent>
      </Card>

      {/* Enquiry Modal */}
      <Modal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        title={`Enquire: ${property.name}`}
      >
        <EnquiryForm
          propertyId={property.id}
          propertySlug={property.slug}
          preferredLocation={property.city}
          propertyType={property.propertyType}
          onSuccess={() => setIsEnquiryOpen(false)}
        />
      </Modal>

      {/* Site Visit Modal */}
      <Modal
        isOpen={isVisitOpen}
        onClose={() => setIsVisitOpen(false)}
        title="Schedule a Site Visit"
      >
        <SiteVisitForm
          propertyId={property.id}
          propertyName={property.name}
          onSuccess={() => setIsVisitOpen(false)}
        />
      </Modal>
    </>
  );
}
