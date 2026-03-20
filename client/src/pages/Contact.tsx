import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Phone, Mail, MapPin, Send } from "lucide-react";

import { toast } from "sonner";
import {
  setPageTitle,
  setPageDescription,
  setOpenGraphImage,
  setCanonicalUrl,
  addJsonLd,
  createBreadcrumbSchema,
  createFAQSchema,
  getFullUrl,
} from "@/lib/seoHelpers";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const { data: settings } = trpc.settings.get.useQuery();
  const submitMutation = trpc.contacts.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: (error: any) => {
      console.error("Contact submission error:", error);
      const errorMessage = error?.message || "Failed to send message. Please try again.";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    // Set page title and meta tags
    setPageTitle("Contact IMI Design | BIM & MEPF Services");
    setPageDescription(
      "Get in touch with IMI Design for BIM coordination and MEPF design services. We respond within 24 hours. Call or email us today."
    );
    setCanonicalUrl(getFullUrl("/contact"));
    setOpenGraphImage(
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663379809910/dQGMwfPzENE9oJMqbRVUVv/og-image-contact-evTTTa4kGeJenhvtkdALja.png",
      "Contact IMI Design - BIM & MEPF Design Services"
    );

    // Add breadcrumb schema
    const breadcrumbSchema = createBreadcrumbSchema([
      { name: "Home", url: getFullUrl("/") },
      { name: "Contact", url: getFullUrl("/contact") },
    ]);
    addJsonLd(breadcrumbSchema);

    // Add FAQ schema
    const faqSchema = createFAQSchema([
      {
        question: "How long does a typical project take?",
        answer: "Project timelines vary based on complexity and scope. We'll provide a detailed timeline during the initial consultation.",
      },
      {
        question: "What is your pricing structure?",
        answer: "We offer competitive pricing tailored to your project requirements. Contact us for a custom quote.",
      },
      {
        question: "Do you provide ongoing support?",
        answer: "Yes, we offer post-project support and maintenance services to ensure your satisfaction.",
      },
      {
        question: "Can you work with our existing team?",
        answer: "Absolutely! We specialize in collaboration and can integrate seamlessly with your team.",
      },
    ]);
    addJsonLd(faqSchema);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container py-4">
        <Breadcrumb items={[{ label: "Contact" }]} />
      </div>

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="mb-6">Get In Touch</h1>
            <p className="text-xl text-muted-foreground">
              Have a question or ready to start your project? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              {settings?.phone && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1">Phone</h4>
                    <p className="text-muted-foreground">{settings.phone}</p>
                  </div>
                </div>
              )}

              {settings?.email && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1">Email</h4>
                    <p className="text-muted-foreground">{settings.email}</p>
                  </div>
                </div>
              )}

              {settings?.address && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1">Address</h4>
                    <p className="text-muted-foreground">{settings.address}</p>
                  </div>
                </div>
              )}

              {/* Response Time */}
              <div className="card-elegant">
                <h4 className="mb-2">Response Time</h4>
                <p className="text-sm text-muted-foreground">
                  We typically respond to inquiries within 24 hours during business days.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="card-elegant">
                <h3 className="mb-6">Send us a Message</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                    {submitMutation.isPending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container max-w-4xl">
          <div className="section-title">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How long does a typical project take?",
                a: "Project timelines vary based on complexity and scope. We'll provide a detailed timeline during the initial consultation.",
              },
              {
                q: "What is your pricing structure?",
                a: "We offer competitive pricing tailored to your project requirements. Contact us for a custom quote.",
              },
              {
                q: "Do you provide ongoing support?",
                a: "Yes, we offer post-project support and maintenance services to ensure your satisfaction.",
              },
              {
                q: "Can you work with our existing team?",
                a: "Absolutely! We specialize in collaboration and can integrate seamlessly with your team.",
              },
            ].map((item, i) => (
              <details key={i} className="card-elegant group cursor-pointer">
                <summary className="font-semibold flex items-center justify-between">
                  {item.q}
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-muted-foreground mt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
