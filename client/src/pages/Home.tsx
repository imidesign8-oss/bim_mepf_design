import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Zap, Briefcase, Users, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Footer from "@/components/Footer";
import {
  setPageTitle,
  setPageDescription,
  setOpenGraphImage,
  setCanonicalUrl,
  addJsonLd,
  createOrganizationSchema,
  createLocalBusinessSchema,
  createFAQSchema,
  getFullUrl,
} from "@/lib/seoHelpers";
import { faqData, convertFAQToSchema } from "@/lib/faqData";
import FAQSection from "@/components/FAQSection";

export default function Home() {
  const { user } = useAuth();
  const { data: services } = trpc.services.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  useEffect(() => {
    // Set page title and meta tags
    setPageTitle("BIM & MEPF Design Services | Professional Coordination & Modeling");
    setPageDescription(
      "Professional BIM and MEPF design services with 3D modeling, clash detection, and MEP coordination. Expert building design solutions for modern projects."
    );
    setCanonicalUrl(getFullUrl("/"));
    setOpenGraphImage(
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663379809910/dQGMwfPzENE9oJMqbRVUVv/og-image-home-gfEqx39qqX76uf2HjqitJ8.png",
      "BIM & MEPF Design Services - Professional Building Design"
    );

    // Add Organization schema
    const orgSchema = createOrganizationSchema({
      name: "IMI Design - BIM & MEPF Design Services",
      description:
        "Professional BIM and MEPF design services for modern buildings. Expert coordination, precision modeling, and innovative solutions.",
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
      sameAs: [
        "https://www.linkedin.com/company/imidesign",
        "https://twitter.com/imidesign",
        "https://www.facebook.com/imidesign",
        "https://www.instagram.com/imidesign",
      ],
    });
    addJsonLd(orgSchema);

    // Add LocalBusiness schema
    const localBusinessSchema = createLocalBusinessSchema({
      name: "IMI Design - BIM & MEPF Design Services",
      description:
        "Professional BIM and MEPF design services for modern buildings. Expert coordination, precision modeling, and innovative solutions.",
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
      sameAs: [
        "https://www.linkedin.com/company/imidesign",
        "https://twitter.com/imidesign",
        "https://www.facebook.com/imidesign",
        "https://www.instagram.com/imidesign",
      ],
    });
    addJsonLd(localBusinessSchema);

    // Add FAQ schema
    const faqSchema = createFAQSchema(convertFAQToSchema(faqData));
    addJsonLd(faqSchema);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 slide-up">
              Professional <span className="gradient-text">BIM & MEPF Design</span> Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Expert BIM modeling and MEPF coordination for modern buildings. We deliver precision 3D coordination, clash detection, and innovative design solutions for commercial and residential projects.
            </p>
            <div className="flex gap-4 justify-center flex-wrap items-center">
              <a href="/quote" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2 cursor-pointer">
                Get Quote <ArrowRight size={20} />
              </a>
              <a href="/projects" className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors border border-border inline-flex items-center justify-center">
                View Projects
              </a>
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
                <h3 className="mb-2 text-base">{feature.title}</h3>
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
              <h2>BIM & MEPF Design Services</h2>
              <p>Comprehensive building information modeling and MEP coordination services for modern architecture and construction</p>
            </div>
            <div className="grid-responsive">
              {services.slice(0, 3).map((service) => (
                <a key={service.id} href={`/services/${service.slug}`} className="card-elegant group flex flex-col">
                  {service.image && (
                    <img src={service.image} alt={service.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}
                  <h3 className="mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">{service.shortDescription}</p>
                  <div className="flex items-center text-primary font-semibold whitespace-nowrap">
                    Learn More <ArrowRight size={16} className="ml-2" />
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="/services" className="inline-flex items-center text-primary font-semibold hover:gap-3 gap-2 transition-all">
                View All Services <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Projects Preview */}
      {projects && projects.length > 0 && (
        <section className="section-padding bg-secondary/30">
          <div className="container">
            <div className="section-title">
              <h2>BIM Design Projects & Case Studies</h2>
              <p>Explore our portfolio of successful building design and coordination projects</p>
            </div>
            <div className="grid-responsive">
              {projects.slice(0, 3).map((project) => (
                <a key={project.id} href={`/projects/${project.slug}`} className="card-elegant group overflow-hidden">
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
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="/projects" className="inline-flex items-center text-primary font-semibold hover:gap-3 gap-2 transition-all">
                View All Projects <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <FAQSection
        title="Frequently Asked Questions"
        description="Get answers to common questions about our BIM and MEPF design services."
      />

      {/* Additional Services Links Section */}
      <section className="py-16 md:py-24 bg-card/50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-6 text-center">Our Core Expertise</h2>
            <p className="text-center text-muted-foreground mb-12">
              We specialize in comprehensive BIM and MEPF solutions for modern buildings. Learn more about our specialized services:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="/services/building-information-modeling" className="p-6 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                <h3 className="mb-3">BIM Services</h3>
                <p className="text-sm text-muted-foreground mb-4">3D modeling, coordination, clash detection, and 4D/5D planning</p>
                <span className="text-primary font-semibold text-sm">Learn More →</span>
              </a>
              <a href="/services/mepf-design-modeling-coordination" className="p-6 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                <h3 className="mb-3">MEPF Design</h3>
                <p className="text-sm text-muted-foreground mb-4">Mechanical, electrical, plumbing, and fire protection design coordination</p>
                <span className="text-primary font-semibold text-sm">Learn More →</span>
              </a>
              <a href="/services/quantities-estimating" className="p-6 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                <h3 className="mb-3">Quantities & Estimating</h3>
                <p className="text-sm text-muted-foreground mb-4">Material take-off, bill of quantities, and variation quantification</p>
                <span className="text-primary font-semibold text-sm">Learn More →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="mb-6">Ready to Transform Your Project?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss your BIM and MEPF design requirements and create exceptional solutions together. Explore our <a href="/about" className="text-primary font-semibold hover:underline">about us</a> page to learn more about our team and experience.
          </p>
          <a href="/contact" className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Contact Us Today <ArrowRight size={20} className="ml-2" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
