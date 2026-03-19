import { trpc } from "@/lib/trpc";
import { Edit2, Trash2, Plus, Image, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminProjects() {
  const { data: projects, refetch } = trpc.projects.listAll.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    client: "",
    status: "completed" as const,
    metaTitle: "",
    metaDescription: "",
    galleryImages: [] as string[],
  });
  const [imageUrl, setImageUrl] = useState("");

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully");
      setFormData({
        title: "",
        description: "",
        shortDescription: "",
        client: "",
        status: "completed",
        metaTitle: "",
        metaDescription: "",
        galleryImages: [],
      });
      setImageUrl("");
      setShowForm(false);
      setEditingId(null);
      refetch();
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully");
      setFormData({
        title: "",
        description: "",
        shortDescription: "",
        client: "",
        status: "completed",
        metaTitle: "",
        metaDescription: "",
        galleryImages: [],
      });
      setImageUrl("");
      setShowForm(false);
      setEditingId(null);
      refetch();
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      refetch();
    },
  });

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      shortDescription: project.shortDescription || "",
      client: project.client || "",
      status: project.status || "completed",
      metaTitle: project.metaTitle || "",
      metaDescription: project.metaDescription || "",
      galleryImages: project.galleryImages || [],
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      client: "",
      status: "completed",
      metaTitle: "",
      metaDescription: "",
      galleryImages: [],
    });
    setImageUrl("");
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        galleryImages: [...formData.galleryImages, imageUrl],
      });
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      galleryImages: formData.galleryImages.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Projects Management</h2>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => {
            if (!showForm) {
              setEditingId(null);
              setFormData({
                title: "",
                description: "",
                shortDescription: "",
                client: "",
                status: "completed",
                metaTitle: "",
                metaDescription: "",
                galleryImages: [],
              });
            }
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-elegant">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{editingId ? "Edit Project" : "Create New Project"}</h3>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-secondary rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Project title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Client</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Client name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Short Description</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Brief description for listings"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Detailed project description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="planned">Planned</option>
              </select>
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

            <div>
              <label className="block text-sm font-semibold mb-2">Gallery Images</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2"
                >
                  <Image size={16} />
                  Add
                </button>
              </div>
              {formData.galleryImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? "Updating..." : createMutation.isPending ? "Creating..." : editingId ? "Update Project" : "Create Project"}
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

      {/* Projects List */}
      <div className="card-elegant">
        <h3 className="text-xl font-bold mb-4">All Projects</h3>
        {projects && projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4 font-semibold">{project.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{project.client || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        project.status === "completed" ? "bg-green-100 text-green-800" :
                        project.status === "ongoing" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(project)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate({ id: project.id })}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
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
          <p className="text-muted-foreground text-center py-8">No projects yet</p>
        )}
      </div>
    </div>
  );
}
