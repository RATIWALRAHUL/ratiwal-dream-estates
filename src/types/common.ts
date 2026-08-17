export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  role?: string;
  comment: string;
  rating: number;
  date: string;
}

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
