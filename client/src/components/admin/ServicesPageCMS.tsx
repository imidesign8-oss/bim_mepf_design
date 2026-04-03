import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface ServicesContent {
  pageTitle: string;
  pageSubtitle: string;
  pageDescription: string;
  introTitle: string;
  introDescription: string;
  servicesOverviewTitle: string;
  servicesOverviewDescription: string;
  processTitle: string;
  processDescription: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
}

const defaultContent: ServicesContent = {
  pageTitle: "Our Services",
  pageSubtitle: "Comprehensive BIM & MEPF Solutions",
  pageDescription: "We offer a full range of BIM coordination and MEP design services tailored to your project needs.",
  introTitle: "What We Offer",
  introDescription: "Our comprehensive suite of services covers all aspects of BIM coordination and MEP design.",
  servicesOverviewTitle: "Service Categories",
  servicesOverviewDescription: "Explore our specialized service offerings",
  processTitle: "Our Process",
  processDescription: "A streamlined approach to delivering quality results",
  ctaTitle: "Ready to Get Started?",
  ctaDescription: "Contact us today to discuss your project requirements",
  ctaButtonText: "Contact Us",
};

export default function ServicesPageCMS() {
  const [content, setContent] = useState<ServicesContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("servicesPageContent", JSON.stringify(content));
      toast.success("Services page content saved successfully!");
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services Page CMS</h2>
          <p className="text-sm text-muted-foreground">Manage your services page content</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Page Header */}
      <Card>
        <CardHeader>
          <CardTitle>Page Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Page Title</label>
            <input
              type="text"
              value={content.pageTitle}
              onChange={(e) => setContent({ ...content, pageTitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Subtitle</label>
            <input
              type="text"
              value={content.pageSubtitle}
              onChange={(e) => setContent({ ...content, pageSubtitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Page Description</label>
            <textarea
              value={content.pageDescription}
              onChange={(e) => setContent({ ...content, pageDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Content */}
      <Card>
        <CardHeader>
          <CardTitle>Section Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { key: "intro", label: "Introduction Section" },
            { key: "servicesOverview", label: "Services Overview" },
            { key: "process", label: "Our Process" },
          ].map((section) => (
            <div key={section.key} className="space-y-3 pb-4 border-b border-border last:border-0">
              <h3 className="font-semibold text-sm">{section.label}</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={content[`${section.key}Title` as keyof ServicesContent] as string}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      [`${section.key}Title`]: e.target.value,
                    } as any)
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  value={content[`${section.key}Description` as keyof ServicesContent] as string}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      [`${section.key}Description`]: e.target.value,
                    } as any)
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card>
        <CardHeader>
          <CardTitle>Call-to-Action Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">CTA Title</label>
            <input
              type="text"
              value={content.ctaTitle}
              onChange={(e) => setContent({ ...content, ctaTitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">CTA Description</label>
            <textarea
              value={content.ctaDescription}
              onChange={(e) => setContent({ ...content, ctaDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">CTA Button Text</label>
            <input
              type="text"
              value={content.ctaButtonText}
              onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
