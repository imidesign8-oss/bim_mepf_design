import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";

export default function Services() {
  const { data: services, isLoading } = trpc.services.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="IMI DESIGN" className="h-16 w-auto" />
          </Link>
          <div className="hidden md:flex gap-8">
            <Link href="/"><a className="nav-link">Home</a></Link>
            <Link href="/about"><a className="nav-link">About</a></Link>
            <Link href="/services"><a className="nav-link active">Services</a></Link>
            <Link href="/projects"><a className="nav-link">Projects</a></Link>
            <Link href="/blog"><a className="nav-link">Blog</a></Link>
            <Link href="/contact"><a className="nav-link">Contact</a></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-6">Our Services</h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive BIM and MEPF design solutions tailored to your project requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link key={service.id} href={`/services/${service.slug}`}>
                  <a className="card-elegant group h-full flex flex-col">
                    {service.image && (
                      <img 
                        src={service.image} 
                        alt={service.title} 
                        className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                      />
                    )}
                    {service.icon && (
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                        <span className="text-2xl">{service.icon}</span>
                      </div>
                    )}
                    <h3 className="mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{service.shortDescription}</p>
                    <div className="flex items-center text-primary font-semibold">
                      Learn More <ArrowRight size={16} className="ml-2" />
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-lg p-12 text-center">
              <p className="text-muted-foreground">No services available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Us</h2>
            <p>Excellence in every aspect of our service</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Expert Team", desc: "Highly qualified professionals with years of experience in BIM and MEPF design." },
              { title: "Latest Technology", desc: "We use cutting-edge software and tools for optimal results." },
              { title: "Quality Assurance", desc: "Rigorous quality checks ensure every project meets the highest standards." },
              { title: "Timely Delivery", desc: "We respect deadlines and deliver projects on schedule." },
              { title: "Cost Effective", desc: "Competitive pricing without compromising on quality." },
              { title: "Client Support", desc: "Dedicated support throughout the project lifecycle." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div>
                  <h4 className="mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss your service requirements and find the perfect solution for your project.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Contact Us <ArrowRight size={20} className="ml-2" />
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 BIM & MEPF Design Services. All rights reserved.</p>
        </div>
      </footer>
      <Footer />
    </div>
  );
}
