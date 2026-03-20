import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { addJsonLd, createBreadcrumbSchema, getFullUrl } from "@/lib/seoHelpers";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  useEffect(() => {
    // Create breadcrumb schema with Home as first item
    const schemaItems = [
      { name: "Home", url: getFullUrl("/") },
      ...items
        .filter((item) => item.href)
        .map((item) => ({
          name: item.label,
          url: getFullUrl(item.href!),
        })),
    ];

    const breadcrumbSchema = createBreadcrumbSchema(schemaItems);
    addJsonLd(breadcrumbSchema);
  }, [items]);

  return (
    <nav
      className={`flex items-center gap-2 text-sm text-muted-foreground py-4 ${className}`}
      aria-label="Breadcrumb"
    >
      <Link href="/">
        <a className="flex items-center gap-1 hover:text-primary transition-colors">
          <Home size={16} />
          <span>Home</span>
        </a>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-border" />
          {item.href ? (
            <Link href={item.href}>
              <a className="hover:text-primary transition-colors">{item.label}</a>
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
