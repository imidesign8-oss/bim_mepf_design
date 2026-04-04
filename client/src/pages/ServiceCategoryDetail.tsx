import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { addJsonLd } from "@/lib/seoHelpers";
import { Link } from "wouter";
import { ChevronRight, MapPin, Calendar, ArrowRight } from "lucide-react";

const SERVICE_CATEGORIES = {
  "bim": {
    title: "Building Information Modeling (BIM)",
    description: "3D Modeling · Coordination · Clash Detection · 4D & 5D",
    fullDescription: "Our comprehensive BIM services transform your building projects with advanced 3D modeling, seamless coordination between trades, clash detection to prevent costly conflicts, and 4D/5D analysis for better project planning and cost management.",
    category: "BIM",
    color: "from-blue-500 to-blue-600",
  },
  "mepf": {
    title: "MEPF Design, Modeling & Coordination",
    description: "Mechanical · Electrical · Plumbing · Fire Protection",
    fullDescription: "We provide expert MEPF design and coordination services covering all mechanical, electrical, plumbing, and fire protection systems. Our team ensures all systems are properly integrated, efficient, and compliant with building codes.",
    category: "MEPF",
    color: "from-green-500 to-green-600",
  },
  "quantities-estimation": {
    title: "Quantities & Estimating",
    description: "Material Take-Off · Bill of Quantities · Variation Quantification",
    fullDescription: "Accurate material take-off and cost estimation are critical for project success. Our experienced team provides detailed MTO, comprehensive BOQ preparation, and precise variation quantification to help you control costs.",
    category: "Quantities & Estimation",
    color: "from-orange-500 to-orange-600",
  },
};

export default function ServiceCategoryDetail() {
  const [, params] = useRoute("/services/:categorySlug");
  const categorySlug = params?.categorySlug as keyof typeof SERVICE_CATEGORIES;
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);

  const categoryInfo = categorySlug ? SERVICE_CATEGORIES[categorySlug] : null;

  // Fetch case studies for this category
  const { data: caseStudiesData, isLoading: caseStudiesLoading } = trpc.caseStudies.getByCategory.useQuery(
    { category: categoryInfo?.category as "BIM" | "MEPF" | "Quantities & Estimation" },
    { enabled: !!categoryInfo }
  );

  // Fetch related projects
  const { data: projectsData, isLoading: projectsLoading } = trpc.projects.list.useQuery(
    { limit: 6 }
  );

  useEffect(() => {
    if (caseStudiesData) {
      setCaseStudies(caseStudiesData);
    }
  }, [caseStudiesData]);

  useEffect(() => {
    if (projectsData) {
      setRelatedProjects(Array.isArray(projectsData) ? projectsData : []);
    }
  }, [projectsData]);

  useEffect(() => {
    if (categoryInfo) {
      document.title = `${categoryInfo.title} | IMI Design`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", categoryInfo.description);
      }

      const schemaData = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: categoryInfo.title,
        description: categoryInfo.fullDescription,
        provider: {
          "@type": "Organization",
          name: "IMI Design",
          url: "https://imidesign.in",
          email: "projects@imidesign.in",
        },
      };
      addJsonLd(schemaData);
    }
  }, [categoryInfo]);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-6">The service you're looking for doesn't exist.</p>
          <Link href="/services">
            <a className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Back to Services <ChevronRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/">
              <a className="hover:text-foreground transition-colors">Home</a>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/services">
              <a className="hover:text-foreground transition-colors">Services</a>
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{categoryInfo.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${categoryInfo.color} text-white py-16 md:py-24`}>
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryInfo.title}</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">{categoryInfo.fullDescription}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 md:py-16">
        {/* Case Studies Section */}
        <section className="mb-20">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Case Studies</h2>
            <p className="text-muted-foreground text-lg">
              Explore our successful projects and how we delivered results for our clients.
            </p>
          </div>

          {caseStudiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : caseStudies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy) => (
                <Link key={caseStudy.id} href={`/services/case-studies/${caseStudy.slug}`}>
                  <a className="group block rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300">
                    {/* Featured Image */}
                    {caseStudy.featuredImage && (
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img
                          src={caseStudy.featuredImage}
                          alt={caseStudy.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {caseStudy.title}
                      </h3>

                      {caseStudy.shortDescription && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {caseStudy.shortDescription}
                        </p>
                      )}

                      {/* Project Details */}
                      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                        {caseStudy.clientName && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Client:</span>
                            <span>{caseStudy.clientName}</span>
                          </div>
                        )}
                        {caseStudy.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{caseStudy.location}</span>
                          </div>
                        )}
                        {caseStudy.completionDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{caseStudy.completionDate}</span>
                          </div>
                        )}
                      </div>

                      {/* Read More */}
                      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                        Read Case Study
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">No case studies available yet.</p>
            </div>
          )}
        </section>

        {/* Related Projects Section */}
        <section>
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Related Projects</h2>
            <p className="text-muted-foreground text-lg">
              Discover more of our successful projects across various sectors.
            </p>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : relatedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.slice(0, 6).map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`}>
                  <a className="group block rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300">
                    {/* Featured Image */}
                    {project.featuredImage && (
                      <div className="relative h-48 overflow-hidden bg-muted">
                        <img
                          src={project.featuredImage}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>

                      {project.shortDescription && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {project.shortDescription}
                        </p>
                      )}

                      {/* Project Details */}
                      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                        {project.client && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Client:</span>
                            <span>{project.client}</span>
                          </div>
                        )}
                        {project.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{project.location}</span>
                          </div>
                        )}
                      </div>

                      {/* View Project */}
                      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                        View Project
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">No projects available yet.</p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-20 py-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get in touch with us to discuss how we can help with your {categoryInfo.title.toLowerCase()} needs.
            </p>
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Request a Quote <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
