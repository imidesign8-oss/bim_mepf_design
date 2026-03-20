import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

interface AboutPageCMSEditorProps {
  onClose: () => void;
}

interface AboutPageContent {
  title?: string;
  subtitle?: string;
  mainContent?: string;
  missionTitle?: string;
  missionContent?: string;
  visionTitle?: string;
  visionContent?: string;
}

export default function AboutPageCMSEditor({ onClose }: AboutPageCMSEditorProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [mainContent, setMainContent] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionContent, setMissionContent] = useState("");
  const [visionTitle, setVisionTitle] = useState("");
  const [visionContent, setVisionContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: aboutContent } = trpc.pages.getContent.useQuery({ pageKey: "about" });
  const updateMutation = trpc.pages.updateContent.useMutation({
    onSuccess: () => {
      toast.success("About page content updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update content");
    },
  });

  useEffect(() => {
    if (aboutContent?.content) {
      try {
        const parsed: AboutPageContent = JSON.parse(aboutContent.content);
        setTitle(parsed.title || "");
        setSubtitle(parsed.subtitle || "");
        setMainContent(parsed.mainContent || "");
        setMissionTitle(parsed.missionTitle || "");
        setMissionContent(parsed.missionContent || "");
        setVisionTitle(parsed.visionTitle || "");
        setVisionContent(parsed.visionContent || "");
      } catch (e) {
        console.error("Failed to parse about content:", e);
      }
    }
  }, [aboutContent]);

  const handleSave = async () => {
    setIsSaving(true);
    const contentData: AboutPageContent = {
      title,
      subtitle,
      mainContent,
      missionTitle,
      missionContent,
      visionTitle,
      visionContent,
    };

    updateMutation.mutate({
      pageKey: "about",
      content: JSON.stringify(contentData),
      title: "About Page",
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit About Page Content</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Header Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Page Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., About Our Company"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g., Dedicated to excellence in BIM design"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Main Content</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Main Description</label>
                <Textarea
                  value={mainContent}
                  onChange={(e) => setMainContent(e.target.value)}
                  placeholder="Write the main about page content here..."
                  rows={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Mission Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Mission Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mission Title</label>
                  <Input
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    placeholder="e.g., Our Mission"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mission Description</label>
                  <Textarea
                    value={missionContent}
                    onChange={(e) => setMissionContent(e.target.value)}
                    placeholder="Describe your company mission..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Vision Section */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold mb-4">Vision Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vision Title</label>
                  <Input
                    value={visionTitle}
                    onChange={(e) => setVisionTitle(e.target.value)}
                    placeholder="e.g., Our Vision"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Vision Description</label>
                  <Textarea
                    value={visionContent}
                    onChange={(e) => setVisionContent(e.target.value)}
                    placeholder="Describe your company vision..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
