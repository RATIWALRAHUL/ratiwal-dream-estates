import Link from "next/link";
import { getMetadata } from "@/lib/seo";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { insights } from "@/data/insights";
import { Calendar, User, Clock } from "lucide-react";

export const metadata = getMetadata({
  title: "Property Insights",
  description: "Read land investment guides, legal documentation checklists, and market corridor analysis from our team.",
  slug: "/insights",
});

export default function InsightsPage() {
  const breadcrumbItems = [{ label: "Insights", href: "/insights" }];

  return (
    <section className="py-8" aria-labelledby="insights-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        
        <SectionHeader
          title="Market & Legal Insights"
          subtitle="Real-Estate Blog"
          description="Access vetted guides covering plot buying documentation, title registries, and structural corridor analysis."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {insights.map((article) => (
            <Card key={article.id} className="flex flex-col hover:shadow-md transition-shadow duration-300">
              <CardHeader className="p-5 pb-2">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <span className="text-[10px] text-text-muted flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-primary-blue flex-shrink-0" aria-hidden="true" />
                    <span>{article.readTime}</span>
                  </span>
                </div>
                <CardTitle className="text-base text-primary-dark line-clamp-2">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex-1">
                <p className="text-xs text-text-muted mb-4 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center space-x-4 text-[10px] text-text-muted mt-3">
                  <span className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{article.author}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{article.publishDate}</span>
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-3 mt-auto">
                <Link href={`/insights/${article.slug}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full focus-visible:outline">
                    Read Article
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
