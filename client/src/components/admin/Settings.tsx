import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { data: settings } = trpc.settings.get.useQuery();
  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    phone: "",
    email: "",
    address: "",
    siteTitle: "",
    siteDescription: "",
    siteKeywords: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        companyDescription: settings.companyDescription || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        siteTitle: settings.siteTitle || "",
        siteDescription: settings.siteDescription || "",
        siteKeywords: settings.siteKeywords || "",
      });
    }
  }, [settings]);

  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your website settings and company information</p>
      </div>

      <form onSubmit={handleSubmit} className="card-elegant max-w-2xl">
        <h3 className="text-xl font-bold mb-6">Company Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Company Description</label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Brief description of your company"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Your company address"
            />
          </div>
        </div>

        <div className="border-t border-border my-6 pt-6">
          <h3 className="text-xl font-bold mb-6">SEO Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Site Title</label>
              <input
                type="text"
                name="siteTitle"
                value={formData.siteTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your site title for search engines"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Site Description</label>
              <textarea
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Meta description for search engines"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Site Keywords</label>
              <input
                type="text"
                name="siteKeywords"
                value={formData.siteKeywords}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Comma-separated keywords"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>

      {/* Info Box */}
      <div className="card-elegant bg-blue-50 border-l-4 border-blue-500">
        <h4 className="font-bold mb-2 text-blue-900">SEO Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep your site title under 60 characters</li>
          <li>• Write compelling meta descriptions (150-160 characters)</li>
          <li>• Use relevant keywords that describe your business</li>
          <li>• Update these settings to improve your search engine visibility</li>
        </ul>
      </div>
    </div>
  );
}
