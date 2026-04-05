import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

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
    { label: "MEP Calculator", href: "/mep-calculator" },
  ];

  const handleClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
    // Scroll to top when navigating from mobile menu
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex flex-col">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => handleClick(item.href)}>
                <a className="block px-4 py-3 text-left text-black hover:bg-gray-100 border-b border-gray-100 text-sm font-medium first:rounded-t-lg last:rounded-b-lg last:border-b-0">
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
