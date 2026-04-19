import { useState } from "react";
import { ChevronUp } from "lucide-react";

export default function MobileFooterDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Drawer Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 text-slate-100 py-3 flex items-center justify-center gap-2 border-t border-slate-700 hover:bg-slate-700 transition-colors"
      >
        <span className="font-semibold text-sm">Quick Links</span>
        <ChevronUp
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Drawer Content */}
      {isOpen && (
        <div className="bg-slate-900 border-t border-slate-700 p-4 max-h-64 overflow-y-auto">
          <div className="space-y-3">
            <a
              href="/"
              className="block text-slate-300 hover:text-primary transition-colors text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="/about"
              className="block text-slate-300 hover:text-primary transition-colors text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </a>
            <a
              href="/services"
              className="block text-slate-300 hover:text-primary transition-colors text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Services
            </a>
            <a
              href="/projects"
              className="block text-slate-300 hover:text-primary transition-colors text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </a>
            <a
              href="/blog"
              className="block text-slate-300 hover:text-primary transition-colors text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </a>
            <a
              href="/contact"
              className="block text-slate-300 hover:text-primary transition-colors text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
            <a
              href="/portal"
              className="block text-slate-300 hover:text-primary transition-colors text-sm font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Client Portal
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
