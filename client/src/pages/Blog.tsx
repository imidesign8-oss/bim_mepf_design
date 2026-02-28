import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useState } from "react";

export default function Blog() {
  const [page, setPage] = useState(1);
  const { data: posts, isLoading } = trpc.blog.list.useQuery({ page, limit: 10 });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <a className="text-2xl font-bold text-primary">BIM & MEPF</a>
          </Link>
          <div className="hidden md:flex gap-8">
            <Link href="/"><a className="nav-link">Home</a></Link>
            <Link href="/about"><a className="nav-link">About</a></Link>
            <Link href="/services"><a className="nav-link">Services</a></Link>
            <Link href="/projects"><a className="nav-link">Projects</a></Link>
            <Link href="/blog"><a className="nav-link active">Blog</a></Link>
            <Link href="/contact"><a className="nav-link">Contact</a></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-6">Our Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights, tips, and updates about BIM technology, MEPF design, and industry trends.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts && posts.length > 0 ? (
            <>
              <div className="space-y-8">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <a className="card-elegant group block hover:shadow-xl transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {post.featuredImage && (
                          <img 
                            src={post.featuredImage} 
                            alt={post.title} 
                            className="w-full h-48 object-cover rounded-lg md:col-span-1 group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className={post.featuredImage ? "md:col-span-2" : "md:col-span-3"}>
                          <h3 className="mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                            {post.publishedAt && (
                              <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(post.publishedAt).toLocaleDateString()}
                              </div>
                            )}
                            {post.author && (
                              <div className="flex items-center gap-1">
                                <User size={16} />
                                {post.author}
                              </div>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {post.excerpt || post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center text-primary font-semibold">
                            Read More <ArrowRight size={16} className="ml-2" />
                          </div>
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
                  disabled={!posts || posts.length < 10}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="bg-secondary/30 rounded-lg p-12 text-center">
              <p className="text-muted-foreground">No blog posts available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-secondary/30">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter for the latest insights and updates on BIM and MEPF design.
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
