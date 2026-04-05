/**
 * SEO Utility Functions for managing meta tags and canonical URLs
 */

const CANONICAL_BASE_URL = 'https://imidesign.in';

/**
 * Set canonical URL for the current page
 * @param path - The page path (e.g., '/services', '/about', '/services/building-information-modeling')
 */
export function setCanonicalUrl(path: string) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remove trailing slash except for root
  const cleanPath = normalizedPath === '/' ? '' : normalizedPath.replace(/\/$/, '');
  
  // Construct full canonical URL
  const canonicalUrl = `${CANONICAL_BASE_URL}${cleanPath}`;
  
  // Find or create canonical link element
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  
  canonicalLink.href = canonicalUrl;
}

/**
 * Set page title for SEO
 * @param title - The page title
 */
export function setPageTitle(title: string) {
  document.title = title;
  
  // Also update og:title meta tag
  let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = title;
}

/**
 * Set page description for SEO
 * @param description - The page meta description
 */
export function setPageDescription(description: string) {
  let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description;
  
  // Also update og:description meta tag
  let ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
  if (!ogDescription) {
    ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    document.head.appendChild(ogDescription);
  }
  ogDescription.content = description;
}

/**
 * Set Open Graph image for social sharing
 * @param imageUrl - The full URL of the image
 * @param imageAlt - Alternative text for the image
 */
export function setOgImage(imageUrl: string, imageAlt?: string) {
  let ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
  if (!ogImage) {
    ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    document.head.appendChild(ogImage);
  }
  ogImage.content = imageUrl;
  
  // Set og:image:alt if provided
  if (imageAlt) {
    let ogImageAlt = document.querySelector('meta[property="og:image:alt"]') as HTMLMetaElement;
    if (!ogImageAlt) {
      ogImageAlt = document.createElement('meta');
      ogImageAlt.setAttribute('property', 'og:image:alt');
      document.head.appendChild(ogImageAlt);
    }
    ogImageAlt.content = imageAlt;
  }
}

/**
 * Set Open Graph URL for the current page
 * @param path - The page path
 */
export function setOgUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = normalizedPath === '/' ? '' : normalizedPath.replace(/\/$/, '');
  const ogUrl = `${CANONICAL_BASE_URL}${cleanPath}`;
  
  let ogUrlMeta = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
  if (!ogUrlMeta) {
    ogUrlMeta = document.createElement('meta');
    ogUrlMeta.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrlMeta);
  }
  ogUrlMeta.content = ogUrl;
}

/**
 * Comprehensive SEO setup for a page
 * @param options - SEO options object
 */
export interface SeoOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogImageAlt?: string;
}

export function setSeoMeta(options: SeoOptions) {
  setPageTitle(options.title);
  setPageDescription(options.description);
  setCanonicalUrl(options.path);
  setOgUrl(options.path);
  
  if (options.ogImage) {
    setOgImage(options.ogImage, options.ogImageAlt);
  }
}
