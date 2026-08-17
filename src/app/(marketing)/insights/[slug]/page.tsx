import { notFound } from "next/navigation";
import { getMetadata } from "@/lib/seo";
import { insights } from "@/data/insights";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Calendar, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface InsightPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: InsightPageProps) {
  const { slug } = await params;
  const article = insights.find((art) => art.slug === slug);
  if (!article) {
    return getMetadata({
      title: "Article Not Found",
      noIndex: true,
    });
  }

  return getMetadata({
    title: article.title,
    description: article.excerpt,
    slug: `/insights/${article.slug}`,
  });
}

// Generate static routes at compile time
export async function generateStaticParams() {
  return insights.map((art) => ({
    slug: art.slug,
  }));
}

export default async function InsightDetailPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const article = insights.find((art) => art.slug === slug);

  if (!article) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Insights", href: "/insights" },
    { label: article.title, href: `/insights/${article.slug}` },
  ];

  return (
    <article className="py-8" aria-labelledby="insight-title">
      <Container>
        <Breadcrumbs items={breadcrumbItems} />

        <div className="max-w-3xl mx-auto mt-6">
          <div className="flex items-center space-x-3 mb-4">
            <Badge variant="primary">{article.category}</Badge>
            <span className="text-xs text-text-muted flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-primary-blue flex-shrink-0" aria-hidden="true" />
              <span>{article.readTime}</span>
            </span>
          </div>

          <h1 id="insight-title" className="text-h1 text-primary-dark font-bold font-heading mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-text-muted border-y border-gray-150 py-4 mb-8">
            <span className="flex items-center space-x-1.5">
              <User className="h-4 w-4 text-primary-blue" aria-hidden="true" />
              <span>By {article.author}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="h-4 w-4 text-primary-blue" aria-hidden="true" />
              <span>{article.publishDate}</span>
            </span>
          </div>

          <div className="prose max-w-none text-body text-text-main leading-relaxed space-y-6">
            <p>{article.content}</p>
          </div>
        </div>
      </Container>
    </article>
  );
}
