export interface BreadcrumbItem {
  label: string;
  href: string;
}

export type { Testimonial } from "./testimonial";

export interface Insight {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishDate: string;
  readTime: string;
  coverImage?: string;
}
