import { useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/_core/hooks/useAuth";
import Breadcrumb from "@/components/Breadcrumb";
import {
  setPageTitle,
  setPageDescription,
  setOpenGraphImage,
  setCanonicalUrl,
  addJsonLd,
  createBreadcrumbSchema,
  getFullUrl,
} from "@/lib/seoHelpers";

export default function Services() {
  const { data: services, isLoading } = trpc.services.list.useQuery();

  useEffect(() => {
    // Set page title and meta tags
    setPageTitle("BIM & MEPF Design Services | IMI Design");
    setPageDescription(
      "Professional BIM coordination, MEP design, and 3D visualization services for modern buildings. Expert solutions for mechanical, electrical, and plumbing design."
    );
    setCanonicalUrl(getFullUrl("/services"));
    setOpenGraphImage(
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663379809910/dQGMwfPzENE9oJMqbRVUVv/og-image-services-ZBdW9B3vAXRPJovjAajWFP.png",
      "BIM & MEPF Design Services - Professional Design Solutions"
    );

    // Add breadcrumb schema
    const breadcrumbSchema = createBreadcrumbSchema([
      { name: "Home", url: getFullUrl("/") },
      { name: "Services", url: getFullUrl("/services") },
    ]);
    addJsonLd(breadcrumbSchema);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Breadcrumb */}
      <div className="container py-4">
        <Breadcrumb items={[{ label: "Services" }]} />
      </div>

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
                  <a className="card-elegant group h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                    {service.image && (
                      <div className="relative w-full h-40 overflow-hidden rounded-lg mb-4 flex-shrink-0">
                        <img 
                          src={service.image} 
                          alt={service.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-grow">
                      {service.icon && (
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                          <span className="text-2xl">{service.icon}</span>
                        </div>
                      )}
                      <h3 className="mb-2 group-hover:text-primary transition-colors text-lg font-semibold leading-tight">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">{service.shortDescription}</p>
                      <div className="flex items-center text-primary font-semibold mt-auto pt-4 border-t border-border/50 group-hover:gap-2 transition-all">
                        Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
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

      {/* Related Projects */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title">
            <h2>See Our Work in Action</h2>
            <p>Explore our portfolio of successful projects</p>
          </div>
          <div className="text-center">
            <Link href="/projects">
              <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                View All Projects <ArrowRight size={20} className="ml-2" />
              </a>
            </Link>
          </div>
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
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
