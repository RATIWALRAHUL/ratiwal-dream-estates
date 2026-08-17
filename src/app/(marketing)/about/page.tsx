import { getMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PlaceholderContent } from "@/components/shared/PlaceholderContent";

export const metadata = getMetadata({
  title: "About Us",
  description: "Learn more about Ratiwal Dream Estates, our founding principles, and our commitment to lifelong property consultancy built on trust.",
  slug: "/about",
});

export default function AboutPage() {
  const breadcrumbItems = [{ label: "About Us", href: "/about" }];

  return (
    <section className="py-8" aria-labelledby="about-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        
        <SectionHeader
          title="Lifelong Property Consultancy"
          subtitle="Our Company"
          description="At Ratiwal Dream Estates, we help you acquire verified land assets with complete transactional visibility."
        />

        <div className="space-y-6 max-w-4xl my-8">
          <PlaceholderContent sectionName="Advisory Philosophy & Governance" />
          <PlaceholderContent sectionName="Founders' Profile & Real-Estate Experience" />
          <PlaceholderContent sectionName="Transparency & Legal Compliance Frameworks" />
        </div>
      </Container>
    </section>
  );
}
