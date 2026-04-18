import { Link } from "wouter";
import MobileMenu from "./MobileMenu";
import { useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="w-full px-4 md:px-8 flex items-center justify-between" style={{height: '64px'}}>
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 overflow-hidden">
          <img 
            src="/logo.svg" 
            alt="IMI DESIGN" 
            className="h-8 md:h-10 w-auto" 
            style={{maxHeight: '48px'}} 
          />
        </Link>
        
        <div className="hidden md:flex gap-6 lg:gap-8">
          <a href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </a>
          <a href="/about" className={`nav-link ${isActive("/about") ? "active" : ""}`}>
            About
          </a>
          <a href="/services" className={`nav-link ${isActive("/services") ? "active" : ""}`}>
            Services
          </a>
          <a href="/projects" className={`nav-link ${isActive("/projects") ? "active" : ""}`}>
            Projects
          </a>
          <a href="/blog" className={`nav-link ${isActive("/blog") ? "active" : ""}`}>
            Blog
          </a>
          <a href="/contact" className={`nav-link ${isActive("/contact") ? "active" : ""}`}>
            Contact
          </a>
          <a href="/portal" className={`nav-link ${isActive("/portal") ? "active" : ""}`}>
            Client Portal
          </a>
        </div>
        
        <div className="flex gap-2 md:gap-4 items-center">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
