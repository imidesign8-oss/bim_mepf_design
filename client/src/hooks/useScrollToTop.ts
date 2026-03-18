import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Custom hook that scrolls to top whenever the route changes
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top with smooth behavior
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);
}
