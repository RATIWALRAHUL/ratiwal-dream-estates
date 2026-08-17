import Link from "next/link";
import { getMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { locations } from "@/data/locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata = getMetadata({
  title: "Featured Locations",
  description: "Browse properties and land developments in Jaipur, Ajmer, Navi Mumbai, Panvel, Bhiwadi, and other locations.",
  slug: "/locations",
});

export default function LocationsPage() {
  const breadcrumbItems = [{ label: "Locations", href: "/locations" }];

  return (
    <section className="py-8" aria-labelledby="locations-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        
        <SectionHeader
          title="Vetted Real-Estate Locations"
          subtitle="Explore Locations"
          description="Discover land and plot investment opportunities across Jaipur, Ajmer, Navi Mumbai, Panvel, Bhiwadi, and more."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {locations.map((loc) => (
            <Card key={loc.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="p-5">
                <span className="text-xs text-primary-blue font-semibold uppercase tracking-wider block">
                  {loc.state}
                </span>
                <CardTitle className="text-lg text-primary-dark mt-1">
                  {loc.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-xs text-text-muted mb-4 leading-relaxed">
                  {loc.description}
                </p>
                <Link href={`/locations/${loc.slug}`}>
                  <Button variant="outline" size="sm" className="w-full focus-visible:outline">
                    View Plots in {loc.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
