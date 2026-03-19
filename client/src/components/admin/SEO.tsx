import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@monaco-editor/react";
import { AlertCircle, CheckCircle, Save } from "lucide-react";

const PAGE_TYPES = ["home", "about", "services", "projects", "blog", "contact", "global"] as const;

export default function AdminSEO() {
  const [selectedPageType, setSelectedPageType] = useState<typeof PAGE_TYPES[number]>("home");
  const [formData, setFormData] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogType: "website",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    structuredData: "",
    customHeadCode: "",
    customBodyCode: "",
    robotsIndex: true,
    robotsFollow: true,
    canonicalUrl: "",
    active: true,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Fetch SEO settings for selected page
  const { data: seoData } = trpc.seo.getByPageType.useQuery(
    { pageType: selectedPageType }
  );

  // Update form when data changes
  useEffect(() => {
    if (seoData) {
      setFormData({
        metaTitle: seoData.metaTitle || "",
        metaDescription: seoData.metaDescription || "",
        metaKeywords: seoData.metaKeywords || "",
        ogTitle: seoData.ogTitle || "",
        ogDescription: seoData.ogDescription || "",
        ogImage: seoData.ogImage || "",
        ogType: seoData.ogType || "website",
        twitterTitle: seoData.twitterTitle || "",
        twitterDescription: seoData.twitterDescription || "",
        twitterImage: seoData.twitterImage || "",
        structuredData: seoData.structuredData || "",
        customHeadCode: seoData.customHeadCode || "",
        customBodyCode: seoData.customBodyCode || "",
        robotsIndex: seoData.robotsIndex ?? true,
        robotsFollow: seoData.robotsFollow ?? true,
        canonicalUrl: seoData.canonicalUrl || "",
        active: seoData.active ?? true,
      });
    }
  }, [seoData]);

  // Validate code query (not mutation)
  const validateCodeQuery = trpc.seo.validateCode;

  // Upsert SEO settings mutation
  const upsertMutation = trpc.seo.upsert.useMutation({
    onSuccess: () => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
  });

  const handleValidateCode = async (code: string, type: "json" | "html") => {
    if (!code.trim()) return true;

    try {
      // Use fetch to call the query directly
      const response = await fetch("/api/trpc/seo.validateCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type }),
      });
      const result = await response.json();
      if (!result.valid) {
        setValidationErrors((prev) => ({
          ...prev,
          [type]: result.error || "Invalid code",
        }));
        return false;
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[type];
          return newErrors;
        });
        return true;
      }
    } catch (error) {
      setValidationErrors((prev) => ({
        ...prev,
        [type]: "Failed to validate code",
      }));
      return false;
    }
  };

  const handleSave = async () => {
    // Validate JSON and HTML code
    let isValid = true;

    try {
      if (formData.structuredData.trim()) {
        isValid = await handleValidateCode(formData.structuredData, "json");
      }

      if (formData.customHeadCode.trim()) {
        isValid = (await handleValidateCode(formData.customHeadCode, "html")) && isValid;
      }

      if (formData.customBodyCode.trim()) {
        isValid = (await handleValidateCode(formData.customBodyCode, "html")) && isValid;
      }

      if (!isValid) {
        setSaveStatus("error");
        return;
      }
    } catch (error) {
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    upsertMutation.mutate({
      pageType: selectedPageType,
      ...formData,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">SEO Settings & Code Editor</h2>
        <p className="text-muted-foreground">Manage meta tags, structured data, and custom code for SEO optimization</p>
      </div>

      {/* Page Type Selector */}
      <div className="bg-card border border-border rounded-lg p-4">
        <label className="block text-sm font-medium text-foreground mb-3">Select Page Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PAGE_TYPES.map((pageType) => (
            <button
              key={pageType}
              onClick={() => setSelectedPageType(pageType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPageType === pageType
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {pageType.charAt(0).toUpperCase() + pageType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Tags Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Meta Tags</h3>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Meta Title</label>
          <Input
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            placeholder="Page title for search engines (50-60 chars)"
            maxLength={255}
          />
          <p className="text-xs text-muted-foreground mt-1">{formData.metaTitle.length}/255</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Meta Description</label>
          <Textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            placeholder="Page description for search engines (150-160 chars)"
            maxLength={255}
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1">{formData.metaDescription.length}/255</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Meta Keywords</label>
          <Input
            value={formData.metaKeywords}
            onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
            placeholder="Comma-separated keywords"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.robotsIndex}
              onChange={(e) => setFormData({ ...formData, robotsIndex: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-foreground">Allow indexing (robots:index)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.robotsFollow}
              onChange={(e) => setFormData({ ...formData, robotsFollow: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-foreground">Allow following links (robots:follow)</span>
          </label>
        </div>
      </div>

      {/* Open Graph Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Open Graph (Social Media)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">OG Title</label>
            <Input
              value={formData.ogTitle}
              onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              placeholder="Title for social sharing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">OG Type</label>
            <Input
              value={formData.ogType}
              onChange={(e) => setFormData({ ...formData, ogType: e.target.value })}
              placeholder="website, article, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">OG Description</label>
          <Textarea
            value={formData.ogDescription}
            onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
            placeholder="Description for social sharing"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">OG Image URL</label>
          <Input
            value={formData.ogImage}
            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Twitter Card Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Twitter Card</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Twitter Title</label>
            <Input
              value={formData.twitterTitle}
              onChange={(e) => setFormData({ ...formData, twitterTitle: e.target.value })}
              placeholder="Title for Twitter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Twitter Image URL</label>
            <Input
              value={formData.twitterImage}
              onChange={(e) => setFormData({ ...formData, twitterImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Twitter Description</label>
          <Textarea
            value={formData.twitterDescription}
            onChange={(e) => setFormData({ ...formData, twitterDescription: e.target.value })}
            placeholder="Description for Twitter"
            rows={2}
          />
        </div>
      </div>

      {/* Structured Data Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Structured Data (JSON-LD)</h3>
          {validationErrors.json && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              {validationErrors.json}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Add Schema.org JSON-LD for rich snippets (Organization, LocalBusiness, Service, etc.)
        </p>
        <Editor
          height="300px"
          defaultLanguage="json"
          value={formData.structuredData}
          onChange={(value) => setFormData({ ...formData, structuredData: value || "" })}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Custom Code Sections */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Custom Head Code</h3>
          {validationErrors.html && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              {validationErrors.html}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Add custom code to inject in the &lt;head&gt; section (scripts, styles, meta tags, etc.)
        </p>
        <Editor
          height="250px"
          defaultLanguage="html"
          value={formData.customHeadCode}
          onChange={(value) => setFormData({ ...formData, customHeadCode: value || "" })}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: "on",
          }}
        />
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Custom Body Code</h3>
        <p className="text-sm text-muted-foreground">
          Add custom code to inject in the &lt;body&gt; section (tracking pixels, analytics, etc.)
        </p>
        <Editor
          height="250px"
          defaultLanguage="html"
          value={formData.customBodyCode}
          onChange={(value) => setFormData({ ...formData, customBodyCode: value || "" })}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Other Settings */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Other Settings</h3>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Canonical URL</label>
          <Input
            value={formData.canonicalUrl}
            onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
            placeholder="https://example.com/page"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-foreground">Active</span>
        </label>
      </div>

      {/* Save Button and Status */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={upsertMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save size={18} />
          {saveStatus === "saving" ? "Saving..." : "Save SEO Settings"}
        </Button>

        {saveStatus === "success" && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle size={18} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {saveStatus === "error" && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle size={18} />
            <span>Error saving settings. Please check for validation errors.</span>
          </div>
        )}
      </div>
    </div>
  );
}
