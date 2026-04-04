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

  return (
    <div className="min-h-screen bg-background">{/* Breadcrumb */}
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

      {/* Project Details */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: project.description }} />
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card-elegant sticky top-20">
                <h3 className="mb-6">Project Details</h3>
                <div className="space-y-4">
                  {project.client && (
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-semibold">{project.client}</p>
                    </div>
                  )}
                  {project.completionDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Date</p>
                      <p className="font-semibold">{project.completionDate}</p>
                    </div>
                  )}
                  {project.budget && (
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold">{project.budget}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold capitalize">
                      {project.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="section-padding bg-secondary/30">
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
