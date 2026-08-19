"use client";

import { useState } from "react";
import { Property, PlotOption } from "@/types/property";
import { PropertyDetailHero } from "./PropertyDetailHero";
import { PropertyCinematicGallery } from "./PropertyCinematicGallery";
import { PropertyQuickFacts } from "./PropertyQuickFacts";
import { PropertyOverview } from "./PropertyOverview";
import { PlotOptionsTable } from "./PlotOptionsTable";
import { PropertyAreaCalculator } from "./PropertyAreaCalculator";
import { PropertyMasterplan } from "./PropertyMasterplan";
import { PropertyBrochureDownloads } from "./PropertyBrochureDownloads";
import { PropertyDocumentStatus } from "./PropertyDocumentStatus";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyConnectivityTimeline } from "./PropertyConnectivityTimeline";
import { PropertyLocationMap } from "./PropertyLocationMap";
import { EmbeddedSiteVisit } from "./EmbeddedSiteVisit";
import { StickyPropertyInquiry } from "./StickyPropertyInquiry";
import { MobilePropertyActionBar } from "./MobilePropertyActionBar";
import { PropertyFAQ } from "./PropertyFAQ";
import { RelatedPropertiesGrid } from "./RelatedPropertiesGrid";
import { PropertyFinalCTA } from "./PropertyFinalCTA";
import { Modal } from "@/components/ui/Modal";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SiteVisitForm } from "@/components/forms/SiteVisitForm";

interface PropertyDetailPageClientProps {
  property: Property;
  relatedProperties: Property[];
}

export function PropertyDetailPageClient({
  property,
  relatedProperties,
}: PropertyDetailPageClientProps) {
  const [selectedOption, setSelectedOption] = useState<PlotOption | null>(
    property.plotOptions && property.plotOptions.length > 0 ? property.plotOptions[0] : null
  );

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isVisitOpen, setIsVisitOpen] = useState(false);

  const handleSelectOption = (opt: PlotOption) => {
    setSelectedOption(opt);
    // Smooth scroll to calculator
    const calcEl = document.getElementById("area-calculator");
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="pt-28 pb-16 md:pt-36 bg-[#FFFDF8]">
      <div className="max-w-[1240px] w-[calc(100%-48px)] mx-auto">
        {/* 1. Property Hero */}
        <PropertyDetailHero
          property={property}
          onOpenSiteVisit={() => setIsVisitOpen(true)}
        />

        {/* 2. Cinematic Gallery */}
        <PropertyCinematicGallery
          images={property.images}
          propertyName={property.name}
        />

        {/* 3. Main Content Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Left Reading & Interactive Column (8 cols) */}
          <main className="lg:col-span-8 min-w-0">
            {/* Quick Property Facts */}
            <PropertyQuickFacts property={property} />

            {/* Property Overview */}
            <PropertyOverview property={property} />

            {/* Plot Options & Pricing Table */}
            <PlotOptionsTable
              plotOptions={property.plotOptions}
              selectedOptionId={selectedOption?.id}
              onSelectOption={handleSelectOption}
            />

            {/* Square-Yards / Area & Price Calculator */}
            <PropertyAreaCalculator
              plotOptions={property.plotOptions}
              selectedOption={selectedOption}
            />

            {/* Masterplan & Layout Plan */}
            <PropertyMasterplan
              masterplan={property.masterplan}
              propertyName={property.name}
            />

            {/* Brochure & Document Downloads */}
            <PropertyBrochureDownloads
              brochure={property.brochure}
              propertyName={property.name}
            />

            {/* Documentation & Verification Status */}
            <PropertyDocumentStatus
              documents={property.documentsList}
              propertyName={property.name}
            />

            {/* Amenities & Project Highlights */}
            <PropertyAmenities
              amenities={property.amenitiesList}
              propertyName={property.name}
            />

            {/* Infrastructure & Connectivity Timeline */}
            <PropertyConnectivityTimeline property={property} />

            {/* Location Map */}
            <PropertyLocationMap property={property} />

            {/* Embedded Site-Visit Booking Experience */}
            <EmbeddedSiteVisit property={property} />

            {/* Property FAQ Accordion */}
            <PropertyFAQ property={property} />
          </main>

          {/* Sticky Inquiry Side Panel (4 cols on desktop) */}
          <aside className="hidden lg:block lg:col-span-4">
            <StickyPropertyInquiry
              property={property}
              selectedOption={selectedOption}
              onOpenEnquiryModal={() => setIsEnquiryOpen(true)}
              onOpenSiteVisitModal={() => setIsVisitOpen(true)}
            />
          </aside>
        </div>

        {/* Related Properties */}
        <RelatedPropertiesGrid
          relatedProperties={relatedProperties}
          currentPropertyName={property.name}
        />
      </div>

      {/* Final Conversion Section */}
      <PropertyFinalCTA
        propertyName={property.name}
        locationName={`${property.location}, ${property.city}`}
      />

      {/* Mobile Bottom Action Bar */}
      <MobilePropertyActionBar
        property={property}
        selectedOption={selectedOption}
        onOpenSiteVisitModal={() => setIsVisitOpen(true)}
      />

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
        title={`Schedule Site Visit — ${property.name}`}
      >
        <SiteVisitForm
          propertyId={property.id}
          propertyName={property.name}
          onSuccess={() => setIsVisitOpen(false)}
        />
      </Modal>
    </div>
  );
}
