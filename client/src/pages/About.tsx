import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";

export default function About() {
  const { data: content } = trpc.pages.getContent.useQuery({ pageKey: "about" });
  const { data: settings } = trpc.settings.get.useQuery();

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
            <Link href="/about"><a className="nav-link active">About</a></Link>
            <Link href="/services"><a className="nav-link">Services</a></Link>
            <Link href="/projects"><a className="nav-link">Projects</a></Link>
            <Link href="/blog"><a className="nav-link">Blog</a></Link>
            <Link href="/contact"><a className="nav-link">Contact</a></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-6">About Our Company</h1>
            <p className="text-xl text-muted-foreground">
              We are a team of dedicated professionals specializing in BIM and MEPF design, committed to delivering excellence in every project.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container max-w-4xl">
          {content ? (
            <div className="prose prose-lg max-w-none">
              <h2>{content.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: content.content }} />
              {content.image && content.title && (
                <img src={content.image} alt={content.title} className="w-full rounded-lg shadow-lg my-8" />
              )}
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">About page content coming soon. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="section-title">
            <h2>Our Team</h2>
            <p>Experienced professionals dedicated to your success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "John Smith", role: "BIM Manager", desc: "10+ years in BIM coordination and modeling" },
              { name: "Sarah Johnson", role: "MEPF Lead", desc: "Expert in mechanical, electrical, and plumbing design" },
              { name: "Mike Chen", role: "Project Director", desc: "Ensures timely delivery and client satisfaction" },
            ].map((member, i) => (
              <div key={i} className="card-elegant text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4" />
                <h3 className="mb-1">{member.name}</h3>
                <p className="text-sm text-primary font-semibold mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title">
            <h2>Our Values</h2>
            <p>What drives us every day</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Excellence", desc: "We pursue the highest standards in every project and deliverable." },
              { title: "Innovation", desc: "We embrace new technologies and methodologies to stay ahead." },
              { title: "Integrity", desc: "We conduct business with honesty, transparency, and accountability." },
              { title: "Collaboration", desc: "We work closely with clients and partners for mutual success." },
            ].map((value, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary" />
                </div>
                <div>
                  <h4 className="mb-2">{value.title}</h4>
                  <p className="text-muted-foreground">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="mb-6">Let's Work Together</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to discuss your project? Get in touch with our team today.
          </p>
          <Link href="/contact">
            <a className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Contact Us <ArrowRight size={20} className="ml-2" />
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
