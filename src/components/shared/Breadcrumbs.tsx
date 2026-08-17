import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbItem } from "@/types/common";

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex py-3 text-sm text-text-muted" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center hover:text-primary-blue transition-colors focus-visible:outline"
          >
            <Home className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="inline-flex items-center">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 mx-1 flex-shrink-0" aria-hidden="true" />
              {isLast ? (
                <span className="font-medium text-text-main" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary-blue transition-colors focus-visible:outline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
