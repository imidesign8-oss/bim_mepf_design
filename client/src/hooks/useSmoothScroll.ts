import { useEffect } from "react";

/**
 * Custom hook that enables smooth scrolling to anchor links
 * Usage: Add id="section-name" to elements and href="#section-name" to links
 */
export function useSmoothScroll() {
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked element is a link with a hash href
      const link = target.closest("a[href^='#']") as HTMLAnchorElement;
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);
}
