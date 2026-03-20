import { useState } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";
import { trpc } from "@/lib/trpc";

export default function AdminBlog() {
  const { data: posts, refetch } = trpc.blog.listAll.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
  });

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog post created successfully");
      setFormData({ title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "" });
      setShowForm(false);
      setEditingId(null);
      refetch();
    },
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Blog post updated successfully");
      setFormData({ title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "" });
      setShowForm(false);
      setEditingId(null);
      refetch();
    },
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog post deleted");
      refetch();
    },
  });

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
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
    setFormData({ title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => {
            if (!showForm) {
              setEditingId(null);
              setFormData({ title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "" });
            }
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-elegant">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{editingId ? "Edit Blog Post" : "Create New Blog Post"}</h3>
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
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Excerpt</label>
              <input
                type="text"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Brief excerpt"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Content *</label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your blog post content here..."
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
                {updateMutation.isPending ? "Updating..." : createMutation.isPending ? "Creating..." : editingId ? "Update Post" : "Create Post"}
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

      {/* Posts List */}
      <div className="card-elegant">
        <h3 className="text-xl font-bold mb-4">All Blog Posts</h3>
        {posts && posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4 font-semibold">{post.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(post)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate({ id: post.id })}
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
          <p className="text-muted-foreground text-center py-8">No blog posts yet</p>
        )}
      </div>
    </div>
  );
}
