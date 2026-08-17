import { getMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { properties } from "@/data/properties";

export const metadata = getMetadata({
  title: "All Properties",
  description: "Explore our collection of premium residential and commercial plots in Jaipur, Ajmer, Navi Mumbai, Panvel, Bhiwadi, and other prime locations.",
  slug: "/properties",
});

export default function PropertiesPage() {
  const breadcrumbItems = [{ label: "Properties", href: "/properties" }];

  return (
    <section className="py-8" aria-labelledby="properties-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        
        <SectionHeader
          title="Residential & Commercial Plots"
          subtitle="Properties Portfolio"
          description="Explore our vetted collection of development-ready plots. Select details to view connectivity lists, regulatory approvals, and scheduled visit bookings."
        />

        {/* Property Grid Render */}
        <PropertyGrid properties={properties} />
      </Container>
    </section>
  );
}
