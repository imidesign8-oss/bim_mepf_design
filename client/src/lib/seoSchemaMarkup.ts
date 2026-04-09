/**
 * Comprehensive SEO Schema Markup Utilities
 * Generates JSON-LD structured data for search engines
 */

export interface SchemaMarkupOptions {
  url: string;
  title: string;
  description: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}

/**
 * Generate Service Schema Markup
 * Used for BIM and MEPF services
 */
export function generateServiceSchema(options: {
  name: string;
  description: string;
  provider: string;
  providerUrl: string;
  serviceType: string;
  areaServed?: string[];
  priceRange?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: options.name,
    description: options.description,
    provider: {
      "@type": "Organization",
      name: options.provider,
      url: options.providerUrl,
    },
    serviceType: options.serviceType,
    ...(options.areaServed && { areaServed: options.areaServed }),
    ...(options.priceRange && { priceRange: options.priceRange }),
    ...(options.image && { image: options.image }),
  };
}

/**
 * Generate Article/BlogPost Schema Markup
 */
export function generateArticleSchema(options: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  authorUrl?: string;
  url: string;
  organizationName: string;
  organizationLogo: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: options.headline,
    description: options.description,
    image: options.image,
    datePublished: options.datePublished,
    ...(options.dateModified && { dateModified: options.dateModified }),
    author: {
      "@type": "Person",
      name: options.author,
      ...(options.authorUrl && { url: options.authorUrl }),
    },
    publisher: {
      "@type": "Organization",
      name: options.organizationName,
      logo: {
        "@type": "ImageObject",
        url: options.organizationLogo,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": options.url,
    },
  };
}

/**
 * Generate Project/Portfolio Schema Markup
 */
export function generateProjectSchema(options: {
  name: string;
  description: string;
  image: string;
  url: string;
  client: string;
  completionDate?: string;
  location?: string;
  organizationName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: options.name,
    description: options.description,
    image: options.image,
    url: options.url,
    creator: {
      "@type": "Organization",
      name: options.organizationName,
    },
    client: {
      "@type": "Organization",
      name: options.client,
    },
    ...(options.completionDate && { dateCreated: options.completionDate }),
    ...(options.location && { locationCreated: options.location }),
  };
}

/**
 * Generate FAQPage Schema Markup
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Review/Rating Schema Markup
 */
export function generateReviewSchema(options: {
  reviewRating: number;
  reviewCount: number;
  organizationName: string;
  organizationUrl: string;
  bestRating?: number;
  worstRating?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: options.reviewRating,
    reviewCount: options.reviewCount,
    bestRating: options.bestRating || 5,
    worstRating: options.worstRating || 1,
    name: options.organizationName,
    url: options.organizationUrl,
  };
}

/**
 * Generate Breadcrumb Schema Markup
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Organization Schema Markup
 */
export function generateOrganizationSchema(options: {
  name: string;
  url: string;
  logo: string;
  description: string;
  email: string;
  phone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: options.name,
    url: options.url,
    logo: options.logo,
    description: options.description,
    email: options.email,
    telephone: options.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: options.address.streetAddress,
      addressLocality: options.address.addressLocality,
      addressRegion: options.address.addressRegion,
      postalCode: options.address.postalCode,
      addressCountry: options.address.addressCountry,
    },
    ...(options.sameAs && { sameAs: options.sameAs }),
  };
}

/**
 * Generate LocalBusiness Schema Markup
 */
export function generateLocalBusinessSchema(options: {
  name: string;
  url: string;
  logo: string;
  description: string;
  email: string;
  phone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  businessType?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: options.name,
    url: options.url,
    logo: options.logo,
    description: options.description,
    email: options.email,
    telephone: options.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: options.address.streetAddress,
      addressLocality: options.address.addressLocality,
      addressRegion: options.address.addressRegion,
      postalCode: options.address.postalCode,
      addressCountry: options.address.addressCountry,
    },
    ...(options.businessType && { "@type": options.businessType }),
    ...(options.sameAs && { sameAs: options.sameAs }),
  };
}

/**
 * Generate Product/Service Offer Schema
 */
export function generateOfferSchema(options: {
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
  availability: string;
  url: string;
  organizationName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: options.name,
    description: options.description,
    price: options.price,
    priceCurrency: options.priceCurrency,
    availability: `https://schema.org/${options.availability}`,
    url: options.url,
    seller: {
      "@type": "Organization",
      name: options.organizationName,
    },
  };
}

/**
 * Generate Contact Point Schema
 */
export function generateContactPointSchema(options: {
  contactType: string;
  telephone: string;
  email?: string;
  url?: string;
  areaServed?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    contactType: options.contactType,
    telephone: options.telephone,
    ...(options.email && { email: options.email }),
    ...(options.url && { url: options.url }),
    ...(options.areaServed && { areaServed: options.areaServed }),
  };
}

/**
 * Add schema markup to page head
 */
export function addSchemaMarkup(schema: Record<string, any>) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
