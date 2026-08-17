import { getMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PlaceholderContent } from "@/components/shared/PlaceholderContent";

export const metadata = getMetadata({
  title: "Why Choose Us",
  description: "Discover our core principles: verified properties, absolute documentation transparency, and lifelong advisory.",
  slug: "/why-choose-us",
});

export default function WhyChooseUsPage() {
  const breadcrumbItems = [{ label: "Why Choose Us", href: "/why-choose-us" }];

  return (
    <section className="py-8" aria-labelledby="why-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        
        <SectionHeader
          title="Consulting Built on Vetted Clarity"
          subtitle="Why Trust Us"
          description="We stand apart by enforcing strict verification protocols on every plot in our portfolio."
        />

        <div className="space-y-6 max-w-4xl my-8">
          <PlaceholderContent sectionName="Title Search & Clear Legal Vetting Checklists" />
          <PlaceholderContent sectionName="Zero Unverified Claims Policy" />
          <PlaceholderContent sectionName="Lifelong Post-Sale Consultation & Support" />
        </div>
      </Container>
    </section>
  );
}
