/**
 * FAQ Data for BIM & MEPF Design Services
 * Used for FAQ schema markup and FAQ section on website
 */

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export const faqData: FAQItem[] = [
  {
    question: "What is BIM and why do I need it?",
    answer:
      "BIM (Building Information Modeling) is a digital representation of a building's physical and functional characteristics. It's essential because it enables better coordination between different trades, reduces clashes and errors, improves project efficiency, and provides a comprehensive database for facility management throughout the building's lifecycle.",
    category: "BIM",
  },
  {
    question: "How long does BIM coordination take?",
    answer:
      "BIM coordination timelines vary based on project complexity and size. Typically, coordination cycles take 1-2 weeks per round. For a standard commercial project, initial coordination setup takes 2-4 weeks, with ongoing coordination throughout the design and construction phases. We provide detailed timelines after project assessment.",
    category: "BIM",
  },
  {
    question: "What is the cost of MEP design services?",
    answer:
      "MEP design costs depend on several factors including project size, complexity, location, and specific requirements. Costs typically range from 2-5% of total project cost. We provide detailed quotes after understanding your project scope. Contact us for a customized estimate based on your specific needs.",
    category: "Pricing",
  },
  {
    question: "What file formats do you support?",
    answer:
      "We support all major BIM and CAD file formats including Revit (.rvt), AutoCAD (.dwg), IFC (.ifc), DWF, PDF, and 3D models. We can also work with specialized MEP software formats. If you have files in a specific format, we can typically accommodate them or convert them as needed.",
    category: "Technical",
  },
  {
    question: "How do you handle clash detection?",
    answer:
      "We use advanced clash detection tools and methodologies to identify conflicts between MEP systems and structural elements. Our process includes: automated clash detection using Navisworks or Revit, manual review of critical areas, detailed clash reports with solutions, and coordination meetings to resolve issues before construction.",
    category: "Technical",
  },
  {
    question: "Can you work with existing projects?",
    answer:
      "Yes, we specialize in working with existing projects at any stage. Whether you need to retrofit MEP systems, upgrade existing designs, or coordinate with ongoing construction, we have the expertise to handle it. We can work from existing drawings, site surveys, or even incomplete documentation.",
    category: "Services",
  },
  {
    question: "Do you provide 3D coordination models?",
    answer:
      "Yes, we provide comprehensive 3D coordination models that integrate all MEP systems with structural and architectural elements. These models are invaluable for clash detection, constructability review, and construction planning. We deliver models in multiple formats for easy sharing and collaboration.",
    category: "Deliverables",
  },
  {
    question: "What is your quality assurance process?",
    answer:
      "Our QA process includes multiple review stages: initial design review, clash detection and resolution, constructability review, compliance check with codes and standards, and final coordination review. Every project undergoes rigorous quality checks before delivery to ensure accuracy and completeness.",
    category: "Quality",
  },
  {
    question: "Do you offer support during construction?",
    answer:
      "Yes, we provide comprehensive construction support including site coordination, RFI responses, design modifications, and clash resolution during construction. Our team is available to address any issues that arise during the building process to ensure smooth execution.",
    category: "Support",
  },
  {
    question: "What is your experience with different building types?",
    answer:
      "We have extensive experience across various building types including commercial offices, residential complexes, hospitals, educational institutions, industrial facilities, hospitality projects, and mixed-use developments. Our diverse portfolio enables us to handle unique requirements for any project type.",
    category: "Experience",
  },
];

/**
 * Get FAQ data for a specific category
 */
export function getFAQByCategory(category: string): FAQItem[] {
  return faqData.filter((faq) => faq.category === category);
}

/**
 * Get all unique FAQ categories
 */
export function getFAQCategories(): string[] {
  const categories = new Set(
    faqData
      .map((faq) => faq.category)
      .filter((cat): cat is string => Boolean(cat))
  );
  return Array.from(categories);
}

/**
 * Convert FAQ data to schema format
 */
export function convertFAQToSchema(faqs: FAQItem[]) {
  return faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));
}
