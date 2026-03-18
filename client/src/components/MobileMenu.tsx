import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-secondary rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-16 bg-background z-50 overflow-y-auto">
          <nav className="flex flex-col w-full">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className="px-6 py-4 border-b border-border hover:bg-secondary transition-colors text-foreground text-base font-medium w-full text-left"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
