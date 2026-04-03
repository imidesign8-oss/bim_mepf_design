import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface AboutContent {
  title: string;
  subtitle: string;
  introText: string;
  missionTitle: string;
  missionDescription: string;
  visionTitle: string;
  visionDescription: string;
  valuesTitle: string;
  value1Name: string;
  value1Desc: string;
  value2Name: string;
  value2Desc: string;
  value3Name: string;
  value3Desc: string;
  teamTitle: string;
  teamDescription: string;
}

const defaultContent: AboutContent = {
  title: "About IMI Design",
  subtitle: "Leading BIM & MEPF Design Solutions",
  introText: "We are a team of experienced professionals dedicated to delivering cutting-edge BIM coordination and MEP design services.",
  missionTitle: "Our Mission",
  missionDescription: "To provide innovative BIM solutions that streamline project delivery and enhance collaboration.",
  visionTitle: "Our Vision",
  visionDescription: "To be the leading provider of BIM and MEPF design services in the industry.",
  valuesTitle: "Our Values",
  value1Name: "Excellence",
  value1Desc: "We strive for excellence in every project",
  value2Name: "Innovation",
  value2Desc: "We embrace new technologies and methodologies",
  value3Name: "Collaboration",
  value3Desc: "We work closely with our clients and partners",
  teamTitle: "Our Team",
  teamDescription: "A dedicated team of BIM experts and MEP designers",
};

export default function AboutPageCMS() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("aboutPageContent", JSON.stringify(content));
      toast.success("About page content saved successfully!");
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
          <h2 className="text-2xl font-bold">About Page CMS</h2>
          <p className="text-sm text-muted-foreground">Manage your about page content</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Page Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Page Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Subtitle</label>
            <input
              type="text"
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Introduction Text</label>
            <textarea
              value={content.introText}
              onChange={(e) => setContent({ ...content, introText: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <Card>
        <CardHeader>
          <CardTitle>Mission & Vision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Mission Title</label>
            <input
              type="text"
              value={content.missionTitle}
              onChange={(e) => setContent({ ...content, missionTitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mission Description</label>
            <textarea
              value={content.missionDescription}
              onChange={(e) => setContent({ ...content, missionDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Vision Title</label>
            <input
              type="text"
              value={content.visionTitle}
              onChange={(e) => setContent({ ...content, visionTitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Vision Description</label>
            <textarea
              value={content.visionDescription}
              onChange={(e) => setContent({ ...content, visionDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Values */}
      <Card>
        <CardHeader>
          <CardTitle>Core Values</CardTitle>
          <CardDescription>{content.valuesTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 pb-4 border-b border-border last:border-0">
              <div>
                <label className="block text-sm font-semibold mb-2">Value {i} Name</label>
                <input
                  type="text"
                  value={content[`value${i}Name` as keyof AboutContent] as string}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      [`value${i}Name`]: e.target.value,
                    } as any)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Value {i} Description</label>
                <textarea
                  value={content[`value${i}Desc` as keyof AboutContent] as string}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      [`value${i}Desc`]: e.target.value,
                    } as any)
                  }
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Team Title</label>
            <input
              type="text"
              value={content.teamTitle}
              onChange={(e) => setContent({ ...content, teamTitle: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Team Description</label>
            <textarea
              value={content.teamDescription}
              onChange={(e) => setContent({ ...content, teamDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
