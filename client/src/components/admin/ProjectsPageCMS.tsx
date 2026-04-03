import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface ProjectsContent {
  pageTitle: string;
  pageSubtitle: string;
  pageDescription: string;
  introTitle: string;
  introDescription: string;
  portfolioTitle: string;
  portfolioDescription: string;
  filterAllText: string;
  filterBimText: string;
  filterMepText: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
}

const defaultContent: ProjectsContent = {
  pageTitle: "Our Projects",
  pageSubtitle: "Showcase of Successful BIM & MEPF Implementations",
  pageDescription: "Explore our portfolio of completed projects demonstrating our expertise in BIM coordination and MEP design.",
  introTitle: "Project Portfolio",
  introDescription: "We take pride in delivering successful projects that exceed client expectations.",
  portfolioTitle: "Featured Projects",
  portfolioDescription: "A selection of our recent and notable projects",
  filterAllText: "All Projects",
  filterBimText: "BIM Coordination",
  filterMepText: "MEP Design",
  ctaTitle: "Start Your Project Today",
  ctaDescription: "Let us help you achieve your project goals with our expert services",
  ctaButtonText: "Get in Touch",
};

export default function ProjectsPageCMS() {
  const [content, setContent] = useState<ProjectsContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("projectsPageContent", JSON.stringify(content));
      toast.success("Projects page content saved successfully!");
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
          <h2 className="text-2xl font-bold">Projects Page CMS</h2>
          <p className="text-sm text-muted-foreground">Manage your projects page content</p>
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
            { key: "portfolio", label: "Portfolio Section" },
          ].map((section) => (
            <div key={section.key} className="space-y-3 pb-4 border-b border-border last:border-0">
              <h3 className="font-semibold text-sm">{section.label}</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={content[`${section.key}Title` as keyof ProjectsContent] as string}
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
                  value={content[`${section.key}Description` as keyof ProjectsContent] as string}
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

      {/* Filter Labels */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Labels</CardTitle>
          <CardDescription>Customize project filter button labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">All Projects Label</label>
            <input
              type="text"
              value={content.filterAllText}
              onChange={(e) => setContent({ ...content, filterAllText: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">BIM Coordination Label</label>
            <input
              type="text"
              value={content.filterBimText}
              onChange={(e) => setContent({ ...content, filterBimText: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">MEP Design Label</label>
            <input
              type="text"
              value={content.filterMepText}
              onChange={(e) => setContent({ ...content, filterMepText: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
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
