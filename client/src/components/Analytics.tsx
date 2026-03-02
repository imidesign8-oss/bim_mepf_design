import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Analytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Google Analytics tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-XXXXXXXXXX", {
        page_path: location,
      });
    }
  }, [location]);

  return (
    <>
      {/* Google Analytics Script */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `,
        }}
      />

      {/* Google Search Console Verification */}
      <meta
        name="google-site-verification"
        content="YOUR_VERIFICATION_CODE_HERE"
      />
    </>
  );
}

// Type extension for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
