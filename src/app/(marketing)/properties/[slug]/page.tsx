import { notFound } from "next/navigation";
import { getMetadata } from "@/lib/seo";
import { properties } from "@/data/properties";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyHighlights } from "@/components/property/PropertyHighlights";
import { PropertyEnquiry } from "@/components/property/PropertyEnquiry";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = properties.find((p) => p.slug === slug);
  if (!property) {
    return getMetadata({
      title: "Property Not Found",
      noIndex: true,
    });
  }

  return getMetadata({
    title: property.name,
    description: property.shortDescription,
    slug: `/properties/${property.slug}`,
  });
}

// Generate static paths at build time
export async function generateStaticParams() {
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = properties.find((p) => p.slug === slug);

  if (!property) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: property.name, href: `/properties/${property.slug}` },
  ];

  return (
    <article className="py-8" aria-labelledby="property-detail-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Info Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <h1 id="property-detail-title" className="text-h1 text-primary-dark font-bold font-heading">
              {property.name}
            </h1>
            
            <PropertyGallery images={property.images} />

            <div className="prose max-w-none mt-6">
              <h2 className="text-h3 text-primary-dark font-heading font-semibold border-b pb-2">
                Project Overview
              </h2>
              <p className="text-body text-text-main leading-relaxed mt-4">
                {property.description}
              </p>
            </div>

            <PropertyHighlights property={property} />
          </div>

          {/* Sticky Action Panel Right Column */}
          <div className="lg:col-span-1">
            <PropertyEnquiry property={property} />
          </div>
        </div>
      </Container>
    </article>
  );
}
