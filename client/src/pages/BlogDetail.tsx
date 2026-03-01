import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Calendar, User, Share2 } from "lucide-react";
import { useEffect } from "react";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug: slug || "" });

  useEffect(() => {
    if (post) {
      document.title = post.metaTitle || post.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", post.metaDescription || "");
      }
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
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
          <h1 className="mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Back to Blog
            </a>
          </Link>
        </div>
      </div>
    );
  }

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
            <Link href="/blog"><a className="nav-link active">Blog</a></Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border">
        <div className="container py-4 flex items-center gap-2 text-sm">
          <Link href="/"><a className="text-primary hover:underline">Home</a></Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/blog"><a className="text-primary hover:underline">Blog</a></Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{post.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container max-w-4xl">
          <h1 className="mb-6">{post.title}</h1>
          <div className="flex flex-wrap gap-6 text-muted-foreground">
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
            {post.author && (
              <div className="flex items-center gap-2">
                <User size={18} />
                By {post.author}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImage && (
        <section className="py-8">
          <div className="container max-w-4xl">
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="section-padding">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card-elegant sticky top-20">
                <h3 className="mb-4">Share This Post</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                    <Share2 size={18} />
                    Share on Twitter
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                    <Share2 size={18} />
                    Share on LinkedIn
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                    <Share2 size={18} />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="section-title">
            <h2>Related Articles</h2>
            <p>More insights on BIM and MEPF design</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elegant">
                <div className="w-full h-40 bg-primary/10 rounded-lg mb-4" />
                <h3 className="mb-2">Related Article {i}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Interesting insights about BIM and MEPF design practices.
                </p>
                <div className="flex items-center text-primary font-semibold">
                  Read More <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-6">Stay Updated</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Subscribe to our newsletter for more insights on BIM and MEPF design.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
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
