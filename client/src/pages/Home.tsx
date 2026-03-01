import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Zap, Briefcase, Users, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user } = useAuth();
  const { data: services } = trpc.services.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="IMI DESIGN" className="h-16 w-auto" />
          </Link>
          <div className="hidden md:flex gap-8">
            <Link href="/">
              <a className="nav-link active">Home</a>
            </Link>
            <Link href="/about">
              <a className="nav-link">About</a>
            </Link>
            <Link href="/services">
              <a className="nav-link">Services</a>
            </Link>
            <Link href="/projects">
              <a className="nav-link">Projects</a>
            </Link>
            <Link href="/blog">
              <a className="nav-link">Blog</a>
            </Link>
            <Link href="/contact">
              <a className="nav-link">Contact</a>
            </Link>
          </div>
          <div className="flex gap-4">
            {user?.role === "admin" && (
              <Link href="/admin">
                <a className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Admin
                </a>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 slide-up">
              Professional <span className="gradient-text">BIM & MEPF</span> Design Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform your building projects with cutting-edge BIM technology and expert MEPF design solutions. We deliver precision, efficiency, and innovation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/contact">
                <a className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                  Get Started <ArrowRight size={20} />
                </a>
              </Link>
              <Link href="/projects">
                <a className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors border border-border">
                  View Projects
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Fast Delivery", desc: "Quick turnaround without compromising quality" },
              { icon: Briefcase, title: "Expert Team", desc: "Experienced professionals in BIM & MEPF" },
              { icon: Users, title: "Collaboration", desc: "Seamless coordination with your team" },
              { icon: Award, title: "Quality Assured", desc: "Industry-leading standards and practices" },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h4 className="mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      {services && services.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <div className="section-title">
              <h2>Our Services</h2>
              <p>Comprehensive BIM and MEPF design solutions tailored to your needs</p>
            </div>
            <div className="grid-responsive">
              {services.slice(0, 3).map((service) => (
                <Link key={service.id} href={`/services/${service.slug}`}>
                  <a className="card-elegant group">
                    {service.image && (
                      <img src={service.image} alt={service.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                    )}
                    <h3 className="mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.shortDescription}</p>
                    <div className="flex items-center text-primary font-semibold">
                      Learn More <ArrowRight size={16} className="ml-2" />
                    </div>
                  </a>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/services">
                <a className="inline-flex items-center text-primary font-semibold hover:gap-3 gap-2 transition-all">
                  View All Services <ArrowRight size={20} />
                </a>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Projects Preview */}
      {projects && projects.length > 0 && (
        <section className="section-padding bg-secondary/30">
          <div className="container">
            <div className="section-title">
              <h2>Featured Projects</h2>
              <p>Showcase of our recent and completed projects</p>
            </div>
            <div className="grid-responsive">
              {projects.slice(0, 3).map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`}>
                  <a className="card-elegant group overflow-hidden">
                    {project.featuredImage && (
                      <img 
                        src={project.featuredImage} 
                        alt={project.title} 
                        className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                      />
                    )}
                    <h3 className="mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    {project.client && <p className="text-sm text-muted-foreground mb-2">Client: {project.client}</p>}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.shortDescription}</p>
                    <div className="flex items-center text-primary font-semibold">
                      View Project <ArrowRight size={16} className="ml-2" />
                    </div>
                  </a>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/projects">
                <a className="inline-flex items-center text-primary font-semibold hover:gap-3 gap-2 transition-all">
                  View All Projects <ArrowRight size={20} />
                </a>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="mb-6">Ready to Transform Your Project?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss your BIM and MEPF design requirements and create exceptional solutions together.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Contact Us Today <ArrowRight size={20} className="ml-2" />
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="mb-4">BIM & MEPF Design</h4>
              <p className="text-sm text-muted-foreground">Professional design solutions for modern buildings.</p>
            </div>
            <div>
              <h4 className="mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about"><a className="text-muted-foreground hover:text-primary">About</a></Link></li>
                <li><Link href="/services"><a className="text-muted-foreground hover:text-primary">Services</a></Link></li>
                <li><Link href="/projects"><a className="text-muted-foreground hover:text-primary">Projects</a></Link></li>
                <li><Link href="/blog"><a className="text-muted-foreground hover:text-primary">Blog</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {settings?.email && <li>Email: {settings.email}</li>}
                {settings?.phone && <li>Phone: {settings.phone}</li>}
                {settings?.address && <li>Address: {settings.address}</li>}
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Follow Us</h4>
              <p className="text-sm text-muted-foreground">Connect with us on social media for updates and insights.</p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 BIM & MEPF Design Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
