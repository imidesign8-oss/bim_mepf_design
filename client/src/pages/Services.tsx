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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {orderedCategories.map((category) => (
                <div key={category} className="space-y-6">
                  {/* Category Header */}
                  <div className="border-b-2 border-primary pb-4">
                    <h2 className="text-2xl font-bold text-primary">{category}</h2>
                  </div>

                  {/* Services in Category */}
                  <div className="space-y-4">
                    {groupedServices[category]?.map((service: any) => (
                      <Link key={service.id} href={`/services/${service.slug}`}>
                        <a className="group block p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all duration-300">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                              <Check size={16} className="text-primary" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                                {service.title}
                              </h3>
                              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                {service.shortDescription}
                              </p>
                            </div>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>

                  {/* View All Link */}
                  <Link href={`/services/${category.toLowerCase().replace(/[&\s]+/g, '-')}`}>
                    <a className="inline-flex items-center text-primary font-semibold hover:gap-2 transition-all group">
                      Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Link>
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

      <Footer />
    </div>
  );
}
