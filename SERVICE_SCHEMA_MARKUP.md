# Service Schema Markup Implementation Guide

## Overview

Service Schema markup (JSON-LD) helps search engines understand the services offered by your business, enabling rich snippets in search results. This guide provides detailed implementation instructions for BIM & MEPF Design services.

---

## Service Schema Structure

### Basic Service Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "BIM Modeling Services",
  "description": "Professional Building Information Modeling (BIM) services for commercial and residential projects",
  "url": "https://imidesign.in/services/bim-modeling",
  "image": "https://imidesign.in/images/bim-modeling.jpg",
  "provider": {
    "@type": "Organization",
    "name": "IMI Design - BIM & MEPF Design Services",
    "url": "https://imidesign.in",
    "logo": "https://imidesign.in/logo.svg",
    "telephone": "+91-9876543210",
    "email": "projects@imidesign.in",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Design Street",
      "addressLocality": "Bangalore",
      "addressRegion": "Karnataka",
      "postalCode": "560001",
      "addressCountry": "IN"
    }
  },
  "areaServed": "India",
  "serviceType": "BIM Modeling"
}
```

---

## Service Categories & Schema Implementation

### 1. BIM Modeling Services

**Service Name:** BIM Modeling & Coordination

**Schema Details:**
- **serviceType:** "BIM Modeling"
- **areaServed:** "India"
- **description:** "Professional Building Information Modeling services including 3D coordination, clash detection, and model management"

**Rich Snippet Benefits:**
- Appears in Google Services carousel
- Shows service name, provider, and rating
- Includes service URL and contact information

---

### 2. MEP Coordination Services

**Service Name:** MEP Coordination & Design

**Schema Details:**
- **serviceType:** "MEP Coordination"
- **areaServed:** "India"
- **description:** "Expert MEP (Mechanical, Electrical, Plumbing) coordination and design services for building projects"

**Rich Snippet Benefits:**
- Displays service specialization
- Shows provider credentials
- Includes service area and availability

---

### 3. Quantities & Estimation Services

**Service Name:** Quantities & Cost Estimation

**Schema Details:**
- **serviceType:** "Quantity Estimation"
- **areaServed:** "India"
- **description:** "Accurate quantity takeoff and cost estimation services for construction projects"

**Rich Snippet Benefits:**
- Highlights specialized expertise
- Shows service provider information
- Enables service discovery in search

---

## Enhanced Service Schema with Pricing

### Service Schema with Price Range

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "BIM Modeling Services",
  "description": "Professional Building Information Modeling services",
  "url": "https://imidesign.in/services/bim-modeling",
  "image": "https://imidesign.in/images/bim-modeling.jpg",
  "provider": {
    "@type": "Organization",
    "name": "IMI Design",
    "url": "https://imidesign.in",
    "logo": "https://imidesign.in/logo.svg",
    "telephone": "+91-9876543210",
    "email": "projects@imidesign.in"
  },
  "priceRange": "₹50,000 - ₹500,000",
  "areaServed": "India",
  "serviceType": "BIM Modeling",
  "availability": "Available",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "25"
  }
}
```

### Service Schema with Detailed Pricing

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "BIM Modeling Services",
  "description": "Professional Building Information Modeling services",
  "url": "https://imidesign.in/services/bim-modeling",
  "provider": {
    "@type": "Organization",
    "name": "IMI Design",
    "url": "https://imidesign.in"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": "75000",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "url": "https://imidesign.in/quote"
  },
  "areaServed": "India"
}
```

---

## Implementation in React Components

### Services Page Implementation

```typescript
import { useEffect } from 'react';
import { addJsonLd, createServiceSchema, getFullUrl } from '@/lib/seoHelpers';

export default function Services() {
  const { data: services } = trpc.services.list.useQuery();

  useEffect(() => {
    if (services && services.length > 0) {
      const orgInfo = {
        name: "IMI Design - BIM & MEPF Design Services",
        description: "Professional BIM and MEPF design services",
        url: getFullUrl("/"),
        logo: getFullUrl("/favicon.svg"),
        email: "projects@imidesign.in",
        phone: "+91-9876543210",
        address: {
          streetAddress: "123 Design Street",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          postalCode: "560001",
          addressCountry: "IN",
        },
        sameAs: [],
      };

      // Create schema for each service
      services.forEach((service) => {
        const serviceSchema = createServiceSchema(
          {
            name: service.title,
            description: service.shortDescription || service.description,
            url: getFullUrl(`/services/${service.slug}`),
            image: service.image,
            areaServed: "India",
            serviceType: service.category || service.title,
          },
          orgInfo
        );
        addJsonLd(serviceSchema);
      });
    }
  }, [services]);

  return (
    // Component JSX
  );
}
```

---

## Service Detail Page Schema

### Individual Service Page

```typescript
import { useEffect } from 'react';
import { useRoute } from 'wouter';
import { addJsonLd, getFullUrl } from '@/lib/seoHelpers';

export default function ServiceDetail() {
  const [match, params] = useRoute('/services/:slug');
  const { data: service } = trpc.services.getBySlug.useQuery(
    { slug: params?.slug || '' },
    { enabled: !!params?.slug }
  );

  useEffect(() => {
    if (service) {
      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: service.description,
        url: getFullUrl(`/services/${service.slug}`),
        image: service.image,
        provider: {
          '@type': 'Organization',
          name: 'IMI Design',
          url: getFullUrl('/'),
          logo: getFullUrl('/favicon.svg'),
          telephone: '+91-9876543210',
          email: 'projects@imidesign.in',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '123 Design Street',
            addressLocality: 'Bangalore',
            addressRegion: 'Karnataka',
            postalCode: '560001',
            addressCountry: 'IN',
          },
        },
        areaServed: 'India',
        serviceType: service.category,
        ...(service.priceRange && { priceRange: service.priceRange }),
        ...(service.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: service.rating,
            ratingCount: service.ratingCount || 1,
          },
        }),
      };
      addJsonLd(serviceSchema);
    }
  }, [service]);

  return (
    // Component JSX
  );
}
```

---

## Testing Schema Markup

### Google Rich Results Test

1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your service page URL
3. Click "Test URL"
4. Review the detected structured data

### Expected Rich Results

- Service name and description
- Provider organization information
- Service area (India)
- Rating and review count (if available)
- Price range (if available)

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Schema not detected | Verify JSON-LD is in `<head>` tag |
| Missing fields | Add required properties: name, description, provider |
| Invalid JSON | Use JSON validator to check syntax |
| Provider info missing | Ensure organization details are complete |
| Rating not showing | Add aggregateRating with ratingValue and ratingCount |

---

## SEO Benefits of Service Schema

### Search Visibility
- Enables rich snippets in search results
- Increases click-through rate (CTR) by 20-30%
- Improves visibility for service-related queries

### User Experience
- Displays service details directly in search results
- Shows provider information and contact details
- Includes ratings and reviews

### Conversion Optimization
- Rich snippets stand out from competitors
- Increases trust through provider information
- Facilitates direct contact from search results

---

## Service Schema Best Practices

### 1. Completeness
- Include all required fields: name, description, provider, url
- Add optional fields: image, areaServed, serviceType, rating

### 2. Accuracy
- Ensure service information matches website content
- Keep pricing information current
- Update ratings regularly

### 3. Consistency
- Use same organization information across all service schemas
- Maintain consistent service categorization
- Align with actual service offerings

### 4. Validation
- Test all service pages with Google Rich Results Test
- Monitor Search Console for structured data errors
- Fix issues promptly to maintain rich snippet display

---

## Implementation Checklist

- [ ] Add Service schema to Services page
- [ ] Create schema for each service category
- [ ] Add provider organization information
- [ ] Include service area (India)
- [ ] Add service type/category
- [ ] Test with Google Rich Results Test
- [ ] Monitor Search Console for errors
- [ ] Add pricing information (if available)
- [ ] Include ratings and reviews (if available)
- [ ] Update schema when service information changes
- [ ] Document schema implementation
- [ ] Train team on schema maintenance

---

## Monitoring & Maintenance

### Monthly Tasks
- Check Search Console for schema errors
- Verify rich snippets are displaying
- Update service information if changed

### Quarterly Tasks
- Review and update service descriptions
- Refresh pricing information
- Update ratings and reviews

### Annual Tasks
- Comprehensive schema audit
- Evaluate schema performance impact
- Plan schema enhancements

