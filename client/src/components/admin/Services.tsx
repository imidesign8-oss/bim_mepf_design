import { trpc } from "@/lib/trpc";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminServices() {
  const { data: services, refetch } = trpc.services.listAll.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "BIM" as "BIM" | "MEPF" | "Quantities & Estimation",
    metaTitle: "",
    metaDescription: "",
  });
  const [subServices, setSubServices] = useState<string[]>([]);

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully");
      setFormData({ title: "", description: "", shortDescription: "", category: "BIM", metaTitle: "", metaDescription: "" });
      setSubServices([]);
      setShowForm(false);
      setEditingId(null);
      refetch();
    },
  });

  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      setFormData({ title: "", description: "", shortDescription: "", category: "BIM", metaTitle: "", metaDescription: "" });
      setSubServices([]);
      setShowForm(false);
      setEditingId(null);
      refetch();
    },
  });

  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Service deleted");
      refetch();
    },
  });

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      description: service.description,
      shortDescription: service.shortDescription || "",
      category: service.category || "BIM",
      metaTitle: service.metaTitle || "",
      metaDescription: service.metaDescription || "",
    });
    // Parse existing sub-services
    const parsed = (service.shortDescription || "")
      .split(/[·•\n]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
    setSubServices(parsed);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Title, description, and category are required");
      return;
    }
    
    // Join sub-services with · separator
    const shortDesc = subServices.filter(s => s.length > 0).join(" · ");
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData, shortDescription: shortDesc });
    } else {
      createMutation.mutate({ ...formData, shortDescription: shortDesc });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", shortDescription: "", category: "BIM", metaTitle: "", metaDescription: "" });
    setSubServices([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Services Management</h2>
          <p className="text-muted-foreground">Manage your services</p>
        </div>
        <button
          onClick={() => {
            if (!showForm) {
              setEditingId(null);
              setFormData({ title: "", description: "", shortDescription: "", category: "BIM", metaTitle: "", metaDescription: "" });
            }
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          New Service
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-elegant">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{editingId ? "Edit Service" : "Create New Service"}</h3>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-secondary rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "BIM" | "MEPF" | "Quantities & Estimation" })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="BIM">BIM</option>
                <option value="MEPF">MEPF</option>
                <option value="Quantities & Estimation">Quantities & Estimation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Service title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Sub-Services (Bullet Points)</label>
              <div className="space-y-2">
                {subServices.map((service, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => {
                        const updated = [...subServices];
                        updated[idx] = e.target.value;
                        setSubServices(updated);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Sub-service item"
                    />
                    <button
                      type="button"
                      onClick={() => setSubServices(subServices.filter((_, i) => i !== idx))}
                      className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSubServices([...subServices, ""])}
                  className="w-full px-4 py-2 border border-dashed border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Sub-Service
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Detailed service description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SEO title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Meta Description</label>
                <input
                  type="text"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SEO description"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? "Updating..." : createMutation.isPending ? "Creating..." : editingId ? "Update Service" : "Create Service"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="card-elegant">
        <h3 className="text-xl font-bold mb-4">All Services</h3>
        {services && services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Short Description</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="py-3 px-4">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                        {service.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{service.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{service.shortDescription || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure?")) {
                              deleteMutation.mutate({ id: service.id });
                            }
                          }}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No services yet. Create one to get started!</p>
        )}
      </div>
    </div>
  );
}
