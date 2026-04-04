import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle, Zap, Layers } from "lucide-react";
import { useEffect } from "react";
import { addJsonLd, createServiceSchema, createBreadcrumbSchema, getFullUrl, createOrganizationSchema } from "@/lib/seoHelpers";

// Service vertical insights data
const serviceInsights: Record<string, any> = {
  "building-information-modeling": {
    title: "Building Information Modeling (BIM)",
    capabilities: [
      "3D Modeling & Visualization",
      "Coordination & Clash Detection",
      "4D & 5D Analysis",
      "Model Coordination",
      "Design Optimization",
    ],
    benefits: [
      "Reduce project delays through early clash detection",
      "Improve coordination between design disciplines",
      "Enhance visualization for stakeholder communication",
      "Optimize design decisions with 4D/5D analysis",
      "Streamline construction planning and execution",
    ],
    technologies: [
      "Revit & BIM 360",
      "Navisworks",
      "Solibri",
      "3ds Max",
      "Lumion",
    ],
    process: [
      "Project Requirements Analysis",
      "BIM Model Development",
      "Coordination & Clash Detection",
      "Visualization & Rendering",
      "Model Delivery & Documentation",
    ],
  },
  "mepf-design-modeling-coordination": {
    title: "MEPF Design, Modeling & Coordination",
    capabilities: [
      "Mechanical System Design",
      "Electrical System Design",
      "Plumbing System Design",
      "Fire Protection Design",
      "MEP Coordination & Integration",
    ],
    benefits: [
      "Optimize building systems for efficiency",
      "Ensure code compliance for all MEP systems",
      "Reduce construction conflicts and rework",
      "Improve system performance and reliability",
      "Facilitate seamless handover to contractors",
    ],
    technologies: [
      "Revit MEP",
      "AutoCAD",
      "HVAC Design Software",
      "Electrical Load Calculation Tools",
      "Navisworks for Coordination",
    ],
    process: [
      "System Requirements & Load Calculations",
      "Individual System Design",
      "3D Model Development",
      "Coordination & Clash Resolution",
      "Documentation & Specifications",
    ],
  },
  "quantities-estimating": {
    title: "Quantities & Estimating",
    capabilities: [
      "Material Take-Off (MTO)",
      "Bill of Quantities (BOQ) Preparation",
      "Variation Quantification",
      "Cost Estimation",
      "Schedule Analysis",
    ],
    benefits: [
      "Accurate project cost estimation",
      "Streamline procurement planning",
      "Reduce material waste and cost overruns",
      "Facilitate competitive bidding",
      "Enable precise project budgeting",
    ],
    technologies: [
      "Revit & Dynamo",
      "Excel & Specialized MTO Tools",
      "Cost Estimation Software",
      "Project Management Tools",
      "Database Management Systems",
    ],
    process: [
      "Design Document Review",
      "Quantity Extraction",
      "BOQ Compilation",
      "Cost Analysis & Estimation",
      "Report Generation & Delivery",
    ],
  },
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading } = trpc.services.getBySlug.useQuery({ slug: slug || "" });
  const { data: allServices } = trpc.services.list.useQuery();

  useEffect(() => {
    if (service) {
      document.title = service.metaTitle || service.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", service.metaDescription || "");
      }

      // Add Service schema
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

      const serviceSchema = createServiceSchema(
        {
          name: service.title,
          description: service.shortDescription || service.description || "",
          url: getFullUrl(`/services/${service.slug}`),
          image: service.image || undefined,
          areaServed: "India",
          serviceType: service.title,
        },
        orgInfo
      );
      addJsonLd(serviceSchema);

      // Add breadcrumb schema
      const breadcrumbSchema = createBreadcrumbSchema([
        { name: "Home", url: getFullUrl("/") },
        { name: "Services", url: getFullUrl("/services") },
        { name: service.title, url: getFullUrl(`/services/${service.slug}`) },
      ]);
      addJsonLd(breadcrumbSchema);
    }
  }, [service]);

  // Get related services (exclude current service)
  const relatedServices = allServices?.filter((s: any) => s.id !== service?.id).slice(0, 3) || [];

  // Get service insights based on slug
  const insights = slug ? serviceInsights[slug] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="IMI DESIGN" className="h-16 w-auto" />
            </Link>
          </div>
        </nav>
        <div className="container py-20 text-center">
          <h1 className="mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-8">The service you're looking for doesn't exist.</p>
          <Link href="/services">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Back to Services
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container py-4 flex items-center gap-2 text-sm">
          <Link href="/"><a className="text-primary hover:underline">Home</a></Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/services"><a className="text-primary hover:underline">Services</a></Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{service.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-4">{service.title}</h1>
            <p className="text-xl text-muted-foreground">{service.shortDescription}</p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="section-padding">
        <div className="container max-w-4xl">
          {service.image && (
            <img 
              src={service.image} 
              alt={service.title} 
              className="w-full rounded-lg shadow-lg mb-8"
            />
          )}
          <div className="prose prose-lg max-w-none mb-8 text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:underline prose-code:text-primary prose-code:bg-secondary/30 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-secondary/50 prose-blockquote:border-primary prose-blockquote:text-foreground prose-hr:border-border">
            <div dangerouslySetInnerHTML={{ __html: service.description }} />
          </div>
        </div>
      </section>

      {/* Service Insights */}
      {insights && (
        <>
          {/* Capabilities */}
          <section className="section-padding bg-secondary/30">
            <div className="container">
              <div className="max-w-4xl">
                <h2 className="text-3xl font-bold mb-8">Key Capabilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.capabilities.map((capability: string, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="section-padding">
            <div className="container">
              <div className="max-w-4xl">
                <h2 className="text-3xl font-bold mb-8">Why Choose Our {insights.title} Services?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.benefits.map((benefit: string, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-foreground">{benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Technologies & Tools */}
          <section className="section-padding bg-secondary/30">
            <div className="container">
              <div className="max-w-4xl">
                <h2 className="text-3xl font-bold mb-8">Technologies & Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.technologies.map((tech: string, idx: number) => (
                    <div key={idx} className="flex gap-3 items-center p-4 rounded-lg border border-border hover:border-primary transition-colors">
                      <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="section-padding">
            <div className="container">
              <div className="max-w-4xl">
                <h2 className="text-3xl font-bold mb-8">Our Process</h2>
                <div className="space-y-4">
                  {insights.process.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="pt-1">
                        <p className="text-foreground font-medium">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Related Services */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="section-title">
            <h2>Other Services</h2>
            <p>Explore more of our offerings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedServices && relatedServices.length > 0 ? (
              relatedServices.map((relatedService: any) => (
                <Link key={relatedService.id} href={`/services/${relatedService.slug}`}>
                  <a className="card-elegant block hover:shadow-lg transition-shadow">
                    {relatedService.image && (
                      <img
                        src={relatedService.image}
                        alt={relatedService.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="mb-2">{relatedService.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {relatedService.shortDescription}
                    </p>
                    <div className="flex items-center text-primary font-semibold">
                      Learn More <ArrowRight size={16} className="ml-2" />
                    </div>
                  </a>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center text-muted-foreground">
                <p>No other services available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss how our {service.title} services can help optimize your project.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Request a Quote <ArrowRight size={20} className="ml-2" />
            </a>
          </Link>
        </div>
      </section>

      {/* Footer - Single unified footer */}
      <Footer />
    </div>
  );
}
