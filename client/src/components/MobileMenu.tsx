import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

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
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-lg z-40">
          <nav className="flex flex-col">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className="px-4 py-3 border-b border-border hover:bg-secondary transition-colors text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
