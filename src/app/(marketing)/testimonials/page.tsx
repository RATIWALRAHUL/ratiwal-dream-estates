import { getMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { testimonials } from "@/data/testimonials";
import { Star } from "lucide-react";

export const metadata = getMetadata({
  title: "Client Testimonials",
  description: "Read reviews and success stories from plot buyers and real-estate investors who trust Ratiwal Dream Estates.",
  slug: "/testimonials",
});

export default function TestimonialsPage() {
  const breadcrumbItems = [{ label: "Testimonials", href: "/testimonials" }];

  return (
    <section className="py-8" aria-labelledby="testimonials-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        
        <SectionHeader
          title="Client Testimonials"
          subtitle="Customer Experiences"
          description="Read verified reports from plot buyers and real-estate investors who partner with us for lifelong land advisory."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="p-5 pb-2">
                <div className="flex items-center space-x-1 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning-color text-warning-color" aria-hidden="true" />
                  ))}
                </div>
                <CardTitle className="text-base text-primary-dark">
                  {testimonial.name}
                </CardTitle>
                <span className="text-xs text-text-muted block mt-1">
                  Location: {testimonial.location} {testimonial.role ? `| ${testimonial.role}` : ""}
                </span>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-xs text-text-main italic leading-relaxed">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <span className="text-[10px] text-text-muted mt-3 block">
                  Reviewed on: {testimonial.date}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
