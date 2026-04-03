import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  secondaryButtonText: string;
  featuresTitle: string;
  featuresDescription: string;
  servicesTitle: string;
  servicesDescription: string;
  testimonialsTitle: string;
  testimonialsDescription: string;
  footerCTA: string;
}

const defaultContent: HomeContent = {
  heroTitle: "Professional BIM & MEPF Design Services",
  heroSubtitle: "Transform your building projects",
  heroDescription: "Transform your building projects with cutting-edge BIM technology and expert MEPF design solutions. We deliver precision, efficiency, and innovation.",
  ctaButtonText: "Get Started",
  ctaButtonLink: "/contact",
  secondaryButtonText: "View Projects",
  featuresTitle: "Why Choose Us",
  featuresDescription: "Industry-leading expertise in BIM coordination and MEP design",
  servicesTitle: "Our Services",
  servicesDescription: "Comprehensive BIM and MEPF solutions for your projects",
  testimonialsTitle: "What Our Clients Say",
  testimonialsDescription: "Real feedback from satisfied clients",
  footerCTA: "Ready to transform your project?",
};

export default function HomePageCMS() {
  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage for now (will be replaced with API call)
      localStorage.setItem("homePageContent", JSON.stringify(content));
      toast.success("Home page content saved successfully!");
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setContent(defaultContent);
    toast.info("Content reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Home Page CMS</h2>
          <p className="text-sm text-muted-foreground">Manage your home page content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main banner and call-to-action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Hero Title</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hero Description</label>
            <textarea
              value={content.heroDescription}
              onChange={(e) => setContent({ ...content, heroDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Primary CTA Button Text</label>
              <input
                type="text"
                value={content.ctaButtonText}
                onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Primary CTA Link</label>
              <input
                type="text"
                value={content.ctaButtonLink}
                onChange={(e) => setContent({ ...content, ctaButtonLink: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="/contact"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Secondary Button Text</label>
            <input
              type="text"
              value={content.secondaryButtonText}
              onChange={(e) => setContent({ ...content, secondaryButtonText: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Section Titles & Descriptions</CardTitle>
          <CardDescription>Manage section headers across the page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { key: "features", label: "Features Section" },
            { key: "services", label: "Services Section" },
            { key: "testimonials", label: "Testimonials Section" },
          ].map((section) => (
            <div key={section.key} className="space-y-3 pb-4 border-b border-border last:border-0">
              <h3 className="font-semibold text-sm">{section.label}</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={content[`${section.key}Title` as keyof HomeContent] as string}
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
                  value={content[`${section.key}Description` as keyof HomeContent] as string}
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

      {/* Footer CTA */}
      <Card>
        <CardHeader>
          <CardTitle>Footer CTA</CardTitle>
          <CardDescription>Bottom call-to-action message</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={content.footerCTA}
            onChange={(e) => setContent({ ...content, footerCTA: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <strong className="text-blue-900">Hero:</strong>
            <p className="text-blue-800">{content.heroTitle}</p>
          </div>
          <div>
            <strong className="text-blue-900">CTA Button:</strong>
            <p className="text-blue-800">{content.ctaButtonText} → {content.ctaButtonLink}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
