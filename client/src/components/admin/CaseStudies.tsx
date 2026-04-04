import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit2 } from "lucide-react";

export function CaseStudiesAdmin() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    serviceCategory: "BIM" as "BIM" | "MEPF" | "Quantities & Estimation",
    shortDescription: "",
    description: "",
    clientName: "",
    projectName: "",
    location: "",
    completionDate: "",
    budget: "",
    challenge: "",
    solution: "",
    results: "",
    metaTitle: "",
    metaDescription: "",
  });

  const { data: caseStudies, refetch } = trpc.caseStudies.listAll.useQuery();
  const createMutation = trpc.caseStudies.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreating(false);
      setFormData({
        title: "",
        serviceCategory: "BIM",
        shortDescription: "",
        description: "",
        clientName: "",
        projectName: "",
        location: "",
        completionDate: "",
        budget: "",
        challenge: "",
        solution: "",
        results: "",
        metaTitle: "",
        metaDescription: "",
      });
    },
  });

  const updateMutation = trpc.caseStudies.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setFormData({
        title: "",
        serviceCategory: "BIM",
        shortDescription: "",
        description: "",
        clientName: "",
        projectName: "",
        location: "",
        completionDate: "",
        budget: "",
        challenge: "",
        solution: "",
        results: "",
        metaTitle: "",
        metaDescription: "",
      });
    },
  });

  const deleteMutation = trpc.caseStudies.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (caseStudy: any) => {
    setEditingId(caseStudy.id);
    setFormData({
      title: caseStudy.title,
      serviceCategory: caseStudy.serviceCategory,
      shortDescription: caseStudy.shortDescription || "",
      description: caseStudy.description,
      clientName: caseStudy.clientName || "",
      projectName: caseStudy.projectName || "",
      location: caseStudy.location || "",
      completionDate: caseStudy.completionDate || "",
      budget: caseStudy.budget || "",
      challenge: caseStudy.challenge || "",
      solution: caseStudy.solution || "",
      results: caseStudy.results || "",
      metaTitle: caseStudy.metaTitle || "",
      metaDescription: caseStudy.metaDescription || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Case Studies Management</h2>
        <Button
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingId(null);
            setFormData({
              title: "",
              serviceCategory: "BIM",
              shortDescription: "",
              description: "",
              clientName: "",
              projectName: "",
              location: "",
              completionDate: "",
              budget: "",
              challenge: "",
              solution: "",
              results: "",
              metaTitle: "",
              metaDescription: "",
            });
          }}
        >
          {isCreating ? "Cancel" : "New Case Study"}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {editingId ? "Edit Case Study" : "Create New Case Study"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <Select
                  value={formData.serviceCategory}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, serviceCategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIM">BIM</SelectItem>
                    <SelectItem value="MEPF">MEPF</SelectItem>
                    <SelectItem value="Quantities & Estimation">
                      Quantities & Estimation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  placeholder="Case study title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <Input
                  placeholder="Client name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <Input
                  placeholder="Project name"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  placeholder="Project location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Completion Date</label>
                <Input
                  placeholder="e.g., January 2024"
                  value={formData.completionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, completionDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Budget</label>
                <Input
                  placeholder="e.g., $50,000"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Meta Title (SEO)</label>
                <Input
                  placeholder="SEO title"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Short Description
              </label>
              <Input
                placeholder="Brief description for listings"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Meta Description (SEO)
              </label>
              <Input
                placeholder="SEO description"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <Textarea
                placeholder="Detailed case study description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Challenge</label>
                <Textarea
                  placeholder="What was the challenge?"
                  value={formData.challenge}
                  onChange={(e) =>
                    setFormData({ ...formData, challenge: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Solution</label>
                <Textarea
                  placeholder="How did you solve it?"
                  value={formData.solution}
                  onChange={(e) =>
                    setFormData({ ...formData, solution: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Results</label>
                <Textarea
                  placeholder="What were the results?"
                  value={formData.results}
                  onChange={(e) =>
                    setFormData({ ...formData, results: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update Case Study" : "Create Case Study"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Case Studies Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {caseStudies && caseStudies.length > 0 ? (
              caseStudies.map((caseStudy: any) => (
                <tr
                  key={caseStudy.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded">
                      {caseStudy.serviceCategory}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium">{caseStudy.title}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {caseStudy.clientName || "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {caseStudy.location || "-"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(caseStudy)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} className="text-blue-500" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this case study?"
                            )
                          ) {
                            deleteMutation.mutate({ id: caseStudy.id });
                          }
                        }}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No case studies yet. Create one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
