import { notFound } from "next/navigation";
import { getMetadata } from "@/lib/seo";
import { locations } from "@/data/locations";
import { properties } from "@/data/properties";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PropertyGrid } from "@/components/property/PropertyGrid";

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = locations.find((l) => l.slug === slug);
  if (!location) {
    return getMetadata({
      title: "Location Not Found",
      noIndex: true,
    });
  }

  return getMetadata({
    title: `Plots in ${location.name}`,
    description: location.description,
    slug: `/locations/${location.slug}`,
  });
}

// Generate static routes at compile time
export async function generateStaticParams() {
  return locations.map((loc) => ({
    slug: loc.slug,
  }));
}

export default async function LocationDetailPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = locations.find((l) => l.slug === slug);

  if (!location) {
    notFound();
  }

  // Filter local properties dataset by city match
  const regionalProperties = properties.filter(
    (prop) => prop.city.toLowerCase() === location.name.toLowerCase()
  );

  const breadcrumbItems = [
    { label: "Locations", href: "/locations" },
    { label: location.name, href: `/locations/${location.slug}` },
  ];

  return (
    <section className="py-8" aria-labelledby="location-detail-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        
        <SectionHeader
          title={`Plots in ${location.name}`}
          subtitle="Location Portfolio"
          description={location.description}
        />

        <div className="my-8">
          <PropertyGrid properties={regionalProperties} />
        </div>
      </Container>
    </section>
  );
}
