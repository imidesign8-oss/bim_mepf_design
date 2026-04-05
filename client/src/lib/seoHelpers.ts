/**
 * SEO Helper Utilities
 * Provides functions for managing meta tags, structured data, and Open Graph tags
 */

export interface SchemaOrganization {
  name: string;
  description: string;
  url: string;
  logo: string;
  email: string;
  phone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs: string[];
}

export interface SchemaService {
  name: string;
  description: string;
  url: string;
  image?: string;
  areaServed?: string;
  serviceType?: string;
}

/**
 * Set meta tag in document head
 */
export function setMetaTag(name: string, content: string, isProperty = false) {
  let meta = document.querySelector(
    `meta[${isProperty ? 'property' : 'name'}="${name}"]`
  ) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(isProperty ? 'property' : 'name', name);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

/**
 * Set page title
 */
export function setPageTitle(title: string) {
  document.title = title;
  setMetaTag('og:title', title, true);
  setMetaTag('twitter:title', title);
}

/**
 * Set page description
 */
export function setPageDescription(description: string) {
  setMetaTag('description', description);
  setMetaTag('og:description', description, true);
  setMetaTag('twitter:description', description);
}

/**
 * Set Open Graph image
 */
export function setOpenGraphImage(imageUrl: string, alt?: string) {
  setMetaTag('og:image', imageUrl, true);
  if (alt) {
    setMetaTag('og:image:alt', alt, true);
  }
  // Twitter card image
  setMetaTag('twitter:image', imageUrl);
}

/**
 * Set canonical URL - Prevents duplicate canonical links
 */
export function setCanonicalUrl(url: string) {
  // Remove all existing canonical tags to prevent duplicates
  const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
  existingCanonicals.forEach((tag, index) => {
    if (index > 0) {
      tag.remove();
    }
  });

  // Update or create the single canonical link
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
  setMetaTag('og:url', url, true);
}

/**
 * Add JSON-LD structured data to document head
 */
export function addJsonLd(schema: Record<string, any>) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Create Organization schema
 */
export function createOrganizationSchema(org: SchemaOrganization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    description: org.description,
    url: org.url,
    logo: org.logo,
    email: org.email,
    telephone: org.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry,
    },
    sameAs: org.sameAs,
  };
}

/**
 * Create LocalBusiness schema
 */
export function createLocalBusinessSchema(org: SchemaOrganization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: org.name,
    description: org.description,
    url: org.url,
    logo: org.logo,
    email: org.email,
    telephone: org.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry,
    },
    image: org.logo,
    sameAs: org.sameAs,
  };
}

/**
 * Create Service schema
 */
export function createServiceSchema(service: SchemaService, provider: SchemaOrganization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    image: service.image || provider.logo,
    provider: {
      '@type': 'Organization',
      name: provider.name,
      url: provider.url,
      logo: provider.logo,
    },
    ...(service.areaServed && { areaServed: service.areaServed }),
    ...(service.serviceType && { serviceType: service.serviceType }),
  };
}

/**
 * Create BreadcrumbList schema
 */
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Create FAQ schema
 */
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Create Article schema for blog posts
 */
export function createArticleSchema(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  articleBody?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: article.author ? {
      '@type': 'Person',
      name: article.author,
    } : undefined,
    articleBody: article.articleBody,
    url: article.url,
  };
}

/**
 * Get full URL for a path
 */
export function getFullUrl(path: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}${path}`;
}

/**
 * Get environment-based image URL
 */
export function getImageUrl(imagePath: string): string {
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // Otherwise, construct the full URL
  return getFullUrl(imagePath);
}
