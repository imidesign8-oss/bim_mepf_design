import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface Project {
  id: number;
  slug: string;
  title: string;
  shortDescription?: string;
  featuredImage?: string;
  client?: string;
  status?: string;
}

interface RelatedProjectsProps {
  projects: Project[];
  title?: string;
  description?: string;
}

export default function RelatedProjects({
  projects,
  title = "Related Projects",
  description = "Explore similar projects showcasing our expertise",
}: RelatedProjectsProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container max-w-5xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <a className="card-elegant group overflow-hidden h-full flex flex-col hover:shadow-lg transition-all">
                {project.featuredImage && (
                  <div className="relative overflow-hidden rounded-lg mb-4 h-40">
                    <img
                      src={project.featuredImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {project.title}
                </h3>

                {project.client && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Client:</span> {project.client}
                  </p>
                )}

                <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
                  {project.shortDescription}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {project.status && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                      {project.status}
                    </span>
                  )}
                  <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    View <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/projects">
            <a className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              View All Projects <ArrowRight size={18} className="ml-2" />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
