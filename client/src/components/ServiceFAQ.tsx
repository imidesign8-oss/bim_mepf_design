import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { addJsonLd, createFAQSchema } from "@/lib/seoHelpers";

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
  serviceType?: string;
}

export default function ServiceFAQ({
  faqs,
  title = "Frequently Asked Questions",
  description,
  serviceType,
}: ServiceFAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Add FAQ schema markup
  useEffect(() => {
    if (faqs && faqs.length > 0) {
      const faqSchema = createFAQSchema(faqs);
      addJsonLd(faqSchema);
    }
  }, [faqs]);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                className="w-full px-6 py-4 flex items-center justify-between bg-background hover:bg-muted/50 transition-colors text-left"
                aria-expanded={expandedIndex === index}
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-primary transition-transform duration-300 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="px-6 py-4 bg-muted/30 border-t border-border">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="font-semibold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Please contact our team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Get in Touch →
          </a>
        </div>
      </div>
    </section>
  );
}
