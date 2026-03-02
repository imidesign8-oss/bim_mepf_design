import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import MobileMenu from "./MobileMenu";
import { useLocation } from "wouter";

export default function Header() {
  const { user } = useAuth();
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
          <Link href="/">
            <a className={`nav-link ${isActive("/") ? "active" : ""}`}>
              Home
            </a>
          </Link>
          <Link href="/about">
            <a className={`nav-link ${isActive("/about") ? "active" : ""}`}>
              About
            </a>
          </Link>
          <Link href="/services">
            <a className={`nav-link ${isActive("/services") ? "active" : ""}`}>
              Services
            </a>
          </Link>
          <Link href="/projects">
            <a className={`nav-link ${isActive("/projects") ? "active" : ""}`}>
              Projects
            </a>
          </Link>
          <Link href="/blog">
            <a className={`nav-link ${isActive("/blog") ? "active" : ""}`}>
              Blog
            </a>
          </Link>
          <Link href="/contact">
            <a className={`nav-link ${isActive("/contact") ? "active" : ""}`}>
              Contact
            </a>
          </Link>
        </div>
        
        <div className="flex gap-2 md:gap-4 items-center">
          {user?.role === "admin" && (
            <Link href="/admin">
              <a className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm md:text-base">
                Admin
              </a>
            </Link>
          )}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
