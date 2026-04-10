/**
 * Service Schema Markup Generator
 * Generates Schema.org Service markup for rich snippets in search results
 */

import { useEffect } from "react";

export interface ServiceSchemaData {
  name: string;
  description: string;
  url: string;
  image?: string;
  provider?: {
    name: string;
    url: string;
  };
  areaServed?: string[];
  priceRange?: string;
  hasOfferCatalog?: boolean;
}

/**
 * Generate Service schema markup
 */
export function generateServiceSchema(data: ServiceSchemaData) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    ...(data.provider && {
      provider: {
        "@type": "Organization",
        name: data.provider.name,
        url: data.provider.url,
      },
    }),
    ...(data.areaServed && {
      areaServed: data.areaServed.map((area) => ({
        "@type": "Country",
        name: area,
      })),
    }),
    ...(data.priceRange && { priceRange: data.priceRange }),
  };

  return schema;
}

/**
 * Add Service schema to page head
 */
export function addServiceSchema(data: ServiceSchemaData) {
  const schema = generateServiceSchema(data);
  const scriptId = `service-schema-${data.name.replace(/\s+/g, "-").toLowerCase()}`;

  // Remove existing schema if present
  const existingScript = document.getElementById(scriptId);
  if (existingScript) {
    existingScript.remove();
  }

  // Create and add new schema
  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Remove Service schema from page
 */
export function removeServiceSchema(serviceName: string) {
  const scriptId = `service-schema-${serviceName.replace(/\s+/g, "-").toLowerCase()}`;
  const script = document.getElementById(scriptId);
  if (script) {
    script.remove();
  }
}

/**
 * Predefined service schemas for common services
 */
export const SERVICE_SCHEMAS: Record<string, ServiceSchemaData> = {
  "bim-design": {
    name: "Building Information Modeling (BIM) Services",
    description:
      "Professional BIM services including 3D modeling, coordination, clash detection, and 4D/5D planning for building projects.",
    url: "https://imidesign.in/services/bim-design",
    image: "https://imidesign.in/images/bim-service.jpg",
    provider: {
      name: "IMI Design",
      url: "https://imidesign.in",
    },
    areaServed: ["IN"],
    priceRange: "$$",
  },
  "mepf-design": {
    name: "MEPF Design & Coordination Services",
    description:
      "Comprehensive MEPF (Mechanical, Electrical, Plumbing, Fire Protection) design and coordination services for modern buildings.",
    url: "https://imidesign.in/services/mepf-design",
    image: "https://imidesign.in/images/mepf-service.jpg",
    provider: {
      name: "IMI Design",
      url: "https://imidesign.in",
    },
    areaServed: ["IN"],
    priceRange: "$$",
  },
  "quantities-estimating": {
    name: "Quantities & Estimating Services",
    description:
      "Material take-off, bill of quantities, and variation quantification services for accurate project budgeting and cost estimation.",
    url: "https://imidesign.in/services/quantities-estimating",
    image: "https://imidesign.in/images/quantities-service.jpg",
    provider: {
      name: "IMI Design",
      url: "https://imidesign.in",
    },
    areaServed: ["IN"],
    priceRange: "$$",
  },
};

/**
 * Hook to add service schema to page
 */
export function useServiceSchema(serviceName: string, customData?: Partial<ServiceSchemaData>) {
  const baseSchema = SERVICE_SCHEMAS[serviceName];

  if (!baseSchema) {
    console.warn(`Service schema not found for: ${serviceName}`);
    return;
  }

  const mergedData = { ...baseSchema, ...customData };

  // Add schema on mount
  useEffect(() => {
    addServiceSchema(mergedData);

    // Cleanup on unmount
    return () => {
      removeServiceSchema(serviceName);
    };
  }, [serviceName, mergedData]);
}
