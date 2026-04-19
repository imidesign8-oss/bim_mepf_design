import { useState, useEffect } from "react";
import { Calculator, FileText, X } from "lucide-react";

export default function QuickActionWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show widget after scrolling down 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
      {/* Expanded Actions */}
      {isExpanded && (
        <>
          <a
            href="/mep-calculator"
            className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Open MEP Calculator"
          >
            <Calculator size={20} />
            <span className="hidden sm:inline text-sm">MEP Calculator</span>
          </a>
          <a
            href="/quote"
            className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            title="Get Quote"
          >
            <FileText size={20} />
            <span className="hidden sm:inline text-sm">Get Quote</span>
          </a>
        </>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
        title={isExpanded ? "Close" : "Quick Actions"}
      >
        {isExpanded ? (
          <X size={24} />
        ) : (
          <span className="text-xl">⚡</span>
        )}
      </button>
    </div>
  );
}
