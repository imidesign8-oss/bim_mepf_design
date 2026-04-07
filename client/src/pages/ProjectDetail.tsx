import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

import { useEffect } from "react";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = trpc.projects.getBySlug.useQuery({ slug: slug || "" });

  useEffect(() => {
    if (project) {
      document.title = project.metaTitle || project.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", project.metaDescription || "");
      }
    }
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!project) {
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
          <h1 className="mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist.</p>
          <Link href="/projects">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Back to Projects
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = Array.isArray(project.galleryImages) 
    ? project.galleryImages 
    : project.galleryImages ? JSON.parse(project.galleryImages) : [];

  // Parse services
  let services: string[] = [];
  if (project.services) {
    if (typeof project.services === 'string') {
      try {
        services = JSON.parse(project.services);
      } catch (e) {
        services = [];
      }
    } else if (Array.isArray(project.services)) {
      services = project.services;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container py-4 flex items-center gap-2 text-sm">
          <Link href="/"><a className="text-primary hover:underline">Home</a></Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/projects"><a className="text-primary hover:underline">Projects</a></Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{project.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-4">{project.title}</h1>
            <p className="text-xl text-muted-foreground">{project.shortDescription}</p>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {project.featuredImage && (
        <section className="py-8">
          <div className="container">
            <img 
              src={project.featuredImage} 
              alt={project.title} 
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </section>
      )}

      {/* Project Details - Card Based Layout */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <div className="space-y-6">
            {/* Project Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Card */}
              {project.client && (
                <div className="card-elegant p-6 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-primary mb-2">CLIENT</p>
                  <p className="text-lg font-bold text-foreground">{project.client}</p>
                </div>
              )}

              {/* Location Card */}
              {project.location && (
                <div className="card-elegant p-6 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-primary mb-2">LOCATION</p>
                  <p className="text-lg font-bold text-foreground">{project.location}</p>
                </div>
              )}

              {/* Status Card */}
              <div className="card-elegant p-6 rounded-lg border border-border">
                <p className="text-sm font-semibold text-primary mb-2">STATUS</p>
                <p className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold capitalize">
                  {project.status}
                </p>
              </div>

              {/* Completion Date Card */}
              {project.completionDate && (
                <div className="card-elegant p-6 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-primary mb-2">COMPLETION DATE</p>
                  <p className="text-lg font-bold text-foreground">{project.completionDate}</p>
                </div>
              )}
            </div>

            {/* Budget Card */}
            {project.budget && (
              <div className="card-elegant p-6 rounded-lg border border-border">
                <p className="text-sm font-semibold text-primary mb-2">BUDGET</p>
                <p className="text-lg font-bold text-foreground">{project.budget}</p>
              </div>
            )}

            {/* Description Card */}
            <div className="card-elegant p-6 rounded-lg border border-border">
              <p className="text-sm font-semibold text-primary mb-4">DESCRIPTION</p>
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed text-justify">
                <div dangerouslySetInnerHTML={{ __html: project.description }} />
              </div>
            </div>

            {/* Services Card */}
            {services.length > 0 && (
              <div className="card-elegant p-6 rounded-lg border border-border">
                <p className="text-sm font-semibold text-primary mb-4">SERVICES PROVIDED</p>
                <ul className="space-y-3">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-foreground font-medium">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container">
            <h2 className="mb-8 text-center">Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages && galleryImages.length > 0 && galleryImages.map((image: string, i: number) => (
                <img 
                  key={i}
                  src={image} 
                  alt={`${project.title} - Image ${i + 1}`} 
                  className="w-full h-48 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="mb-6">Interested in Similar Projects?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss your project requirements and create something exceptional.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Start Your Project <ArrowRight size={20} className="ml-2" />
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
