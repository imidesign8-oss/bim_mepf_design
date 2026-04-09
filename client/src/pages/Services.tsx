import { useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Footer from "@/components/Footer";
import { ArrowRight, Check } from "lucide-react";

import { useAuth } from "@/_core/hooks/useAuth";
import Breadcrumb from "@/components/Breadcrumb";
import {
  setPageTitle,
  setPageDescription,
  setOpenGraphImage,
  setCanonicalUrl,
  addJsonLd,
  createBreadcrumbSchema,
  createServiceSchema,
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
    // Add Service schema for each service
    if (services && services.length > 0) {
      const orgInfo = {
        name: "IMI Design - BIM & MEPF Design Services",
        description: "Professional BIM and MEPF design services",
        url: getFullUrl("/"),
        logo: getFullUrl("/favicon.svg"),
        email: "projects@imidesign.in",
        phone: "+91-9876543210",
        address: {
          streetAddress: "123 Design Street",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          postalCode: "560001",
          addressCountry: "IN",
        },
        sameAs: [],
      };

      services.forEach((service: any) => {
        const serviceSchema = createServiceSchema(
          {
            name: service.title,
            description: service.shortDescription || service.description || "",
            url: getFullUrl(`/services/${service.slug}`),
            image: service.image || undefined,
            areaServed: "India",
            serviceType: service.category || service.title,
          },
          orgInfo
        );
        addJsonLd(serviceSchema);
      });
    }
  }, [services]);

  // Group services by category
  const groupedServices = services?.reduce((acc, service) => {
    const category = service.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, any>) || {};

  const categoryOrder = ["BIM", "MEPF", "Quantities & Estimation"];
  const orderedCategories = categoryOrder.filter(cat => (groupedServices[cat]?.length ?? 0) > 0);

  // Parse sub-services from shortDescription (separated by · or bullet points)
  const parseSubServices = (description: string | null | undefined): string[] => {
    if (!description) return [];
    return description
      .split(/[·•\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

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

      {/* Services by Category */}
      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : orderedCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {orderedCategories.map((category) => (
                <div key={category} className="space-y-6">
                  {/* Category Header */}
                  <div className="border-b-2 border-primary pb-4">
                    <h2 className="text-2xl font-bold text-primary">{category}</h2>
                  </div>

                  {/* Services in Category */}
                  <div className="space-y-8">
                    {groupedServices[category]?.map((service: any) => {
                      const subServices = parseSubServices(service.shortDescription);
                      
                      return (
                        <div key={service.id} className="space-y-3">
                          {/* Service Title */}
                          <Link href={`/services/${service.slug}`}>
                            <a className="group inline-block">
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {service.title}
                              </h3>
                            </a>
                          </Link>

                          {/* Sub-services as Bullet Points */}
                          {subServices.length > 0 && (
                            <ul className="space-y-2 pl-6">
                              {subServices.map((subService, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                  <span className="text-sm text-muted-foreground leading-relaxed">
                                    {subService}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Learn More Link */}
                          <Link href={`/services/${service.slug}`}>
                            <a className="inline-flex items-center text-primary font-medium text-sm hover:gap-2 transition-all group pt-2">
                              Learn More
                              <ArrowRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                          </Link>
                        </div>
                      );
                    })}
                  </div>


                </div>
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

      {/* MEP Calculator CTA */}
      <section className="section-padding bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-4">Quick MEP Cost Estimation</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Need a quick estimate for your MEP design costs? Use our interactive calculator to get city-wise, project-type-specific cost estimates based on verified 2026 industry data.
            </p>
            <Link href="/mep-calculator">
              <a className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Try MEP Calculator
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
