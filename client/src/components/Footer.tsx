import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-100 mt-20">
      {/* Main Footer Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="mb-6">
              <img src="/logo.svg" alt="IMI DESIGN" className="h-12 w-auto" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Professional BIM and MEPF design services for modern buildings. Expert coordination, precision modeling, and innovative solutions.
            </p>
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <a href="mailto:projects@imidesign.in" className="hover:text-primary transition-colors text-sm">
                  projects@imidesign.in
                </a>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  S4 B Block, Colaso Arcade<br />
                  Desterro, Vasco da Gama<br />
                  Goa 403 802, India
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 font-playfair">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className="text-slate-300 hover:text-primary transition-colors text-sm">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-slate-300 hover:text-primary transition-colors text-sm">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-slate-300 hover:text-primary transition-colors text-sm">Services</a>
                </Link>
              </li>
              <li>
                <Link href="/projects">
                  <a className="text-slate-300 hover:text-primary transition-colors text-sm">Projects</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-slate-300 hover:text-primary transition-colors text-sm">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-slate-300 hover:text-primary transition-colors text-sm">Contact</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 font-playfair">Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  BIM Coordination
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  MEP Design
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  3D Modeling
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Clash Detection
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Rendering & Visualization
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-primary transition-colors text-sm">
                  Consulting
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 font-playfair">Connect With Us</h3>
            <p className="text-slate-300 text-sm mb-4">
              Follow us on social media for the latest updates and industry insights.
            </p>
            <div className="flex gap-4 mb-8">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-primary text-white p-3 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-primary text-white p-3 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-primary text-white p-3 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-primary text-white p-3 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>

            {/* Newsletter Signup */}
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              <p>
                &copy; {currentYear} IMI DESIGN. All rights reserved. | BIM & MEPF Design Services
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6 md:justify-end text-slate-400 text-sm">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="border-t border-slate-700 bg-slate-950 py-4">
        <div className="container flex justify-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-slate-400 hover:text-primary transition-colors text-sm font-medium"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
