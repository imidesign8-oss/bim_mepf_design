import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

interface HomePageCMSEditorProps {
  onClose: () => void;
}

interface HomePageContent {
  heroTitle?: string;
  heroSubtitle?: string;
  servicesTitle?: string;
  servicesDescription?: string;
  projectsTitle?: string;
  projectsDescription?: string;
}

export default function HomePageCMSEditor({ onClose }: HomePageCMSEditorProps) {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [servicesTitle, setServicesTitle] = useState("");
  const [servicesDesc, setServicesDesc] = useState("");
  const [projectsTitle, setProjectsTitle] = useState("");
  const [projectsDesc, setProjectsDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: homeContent } = trpc.pages.getContent.useQuery({ pageKey: "home" });
  const updateMutation = trpc.pages.updateContent.useMutation({
    onSuccess: () => {
      toast.success("Home page content updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update content");
    },
  });

  useEffect(() => {
    if (homeContent?.content) {
      try {
        const parsed: HomePageContent = JSON.parse(homeContent.content);
        setHeroTitle(parsed.heroTitle || "");
        setHeroSubtitle(parsed.heroSubtitle || "");
        setServicesTitle(parsed.servicesTitle || "");
        setServicesDesc(parsed.servicesDescription || "");
        setProjectsTitle(parsed.projectsTitle || "");
        setProjectsDesc(parsed.projectsDescription || "");
      } catch (e) {
        console.error("Failed to parse home content:", e);
      }
    }
  }, [homeContent]);

  const handleSave = async () => {
    setIsSaving(true);
    const contentData: HomePageContent = {
      heroTitle,
      heroSubtitle,
      servicesTitle,
      servicesDescription: servicesDesc,
      projectsTitle,
      projectsDescription: projectsDesc,
    };

    updateMutation.mutate({
      pageKey: "home",
      content: JSON.stringify(contentData),
      title: "Home Page",
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Home Page Content</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Hero Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Title</label>
                  <Input
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="e.g., Professional BIM & MEPF Design Services"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                  <Textarea
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="e.g., Transform your building projects with cutting-edge BIM technology..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">Services Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Services Title</label>
                  <Input
                    value={servicesTitle}
                    onChange={(e) => setServicesTitle(e.target.value)}
                    placeholder="e.g., Our Services"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Services Description</label>
                  <Textarea
                    value={servicesDesc}
                    onChange={(e) => setServicesDesc(e.target.value)}
                    placeholder="e.g., Comprehensive BIM and MEPF design solutions..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold mb-4">Projects Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Projects Title</label>
                  <Input
                    value={projectsTitle}
                    onChange={(e) => setProjectsTitle(e.target.value)}
                    placeholder="e.g., Featured Projects"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Projects Description</label>
                  <Textarea
                    value={projectsDesc}
                    onChange={(e) => setProjectsDesc(e.target.value)}
                    placeholder="e.g., Showcase of our recent and completed projects..."
                    rows={3}
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
