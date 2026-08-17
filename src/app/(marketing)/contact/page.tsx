import { getMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { siteConfig } from "@/config/site";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata = getMetadata({
  title: "Contact Us",
  description: "Get in touch with our land consultancy experts. Submit an enquiry or schedule a site-visit.",
  slug: "/contact",
});

export default function ContactPage() {
  const breadcrumbItems = [{ label: "Contact", href: "/contact" }];

  return (
    <section className="py-8" aria-labelledby="contact-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />

        <SectionHeader
          title="Connect With Our Property Experts"
          subtitle="Contact Us"
          description="Send an enquiry through our secure server validated form or reach out directly to coordinate plot consultations."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-8">
          {/* Enquiry Form column */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <EnquiryForm />
            </Card>
          </div>

          {/* Contact Details column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-heading font-semibold text-lg text-primary-dark mb-4 border-b pb-2">
                Contact Details
              </h3>
              
              <ul className="space-y-4 text-sm text-text-main" aria-label="Contact options">
                <li className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-xs text-text-muted block">Direct Phone</span>
                    <span className="font-medium">{siteConfig.contact.phone}</span>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-xs text-text-muted block">Consultation Email</span>
                    <span className="font-medium">{siteConfig.contact.email}</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-xs text-text-muted block">Office Address</span>
                    <span className="font-medium">{siteConfig.contact.address}</span>
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary-blue mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-xs text-text-muted block">Office Hours</span>
                    <span className="font-medium">{siteConfig.contact.officeHours}</span>
                  </div>
                </li>
              </ul>
            </Card>
            
            {/* Google maps placeholder block */}
            <div className="bg-gray-50 rounded aspect-video flex items-center justify-center text-text-muted text-xs p-6 border border-border-color border-dashed">
              [GOOGLE MAPS EMBED PLACEHOLDER]
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
