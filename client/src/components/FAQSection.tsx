import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqData, FAQItem } from "@/lib/faqData";

interface FAQSectionProps {
  title?: string;
  description?: string;
  items?: FAQItem[];
  category?: string;
}

export default function FAQSection({
  title = "Frequently Asked Questions",
  description = "Find answers to common questions about our BIM and MEPF design services.",
  items,
  category,
}: FAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Use provided items or filter by category
  const displayItems = items || (category ? faqData.filter((faq) => faq.category === category) : faqData);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-600 text-lg">{description}</p>
          </div>

          <div className="space-y-4">
            {displayItems.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-red-300 transition-colors"
              >
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-left font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-red-600 flex-shrink-0 transition-transform ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {displayItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No FAQs available for this category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
