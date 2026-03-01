import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Projects() {
  const [page, setPage] = useState(1);
  const { data: projects, isLoading } = trpc.projects.list.useQuery({ page, limit: 12 });

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
            <Link href="/services"><a className="nav-link">Services</a></Link>
            <Link href="/projects"><a className="nav-link active">Projects</a></Link>
            <Link href="/blog"><a className="nav-link">Blog</a></Link>
            <Link href="/contact"><a className="nav-link">Contact</a></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-6">Our Projects</h1>
            <p className="text-xl text-muted-foreground">
              Showcase of our completed and ongoing projects demonstrating our expertise and commitment to excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects && projects.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.slug}`}>
                    <a className="card-elegant group overflow-hidden h-full flex flex-col">
                      {project.featuredImage && (
                        <img 
                          src={project.featuredImage} 
                          alt={project.title} 
                          className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                        />
                      )}
                      <h3 className="mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                      {project.client && (
                        <p className="text-sm text-muted-foreground mb-2">Client: {project.client}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
                        {project.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {project.status}
                        </span>
                        <div className="flex items-center text-primary font-semibold">
                          View <ArrowRight size={16} className="ml-2" />
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-muted-foreground">Page {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!projects || projects.length < 12}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="bg-secondary/30 rounded-lg p-12 text-center">
              <p className="text-muted-foreground">No projects available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Project Stats */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "150+", label: "Projects Completed" },
              { number: "50+", label: "Happy Clients" },
              { number: "10+", label: "Years Experience" },
              { number: "25+", label: "Team Members" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="mb-6">Ready to Start Your Project?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss your requirements and create something amazing together.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Get in Touch <ArrowRight size={20} className="ml-2" />
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
    </div>
  );
}
