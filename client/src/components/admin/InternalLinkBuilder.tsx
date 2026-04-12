import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Link2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface LinkFormData {
  sourcePagePath: string;
  targetPagePath: string;
  anchorText: string;
  linkType: "contextual" | "related" | "navigation" | "footer";
  keywordTarget?: string;
  position?: number;
  notes?: string;
}

export function InternalLinkBuilder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>({
    sourcePagePath: "",
    targetPagePath: "",
    anchorText: "",
    linkType: "contextual",
    keywordTarget: "",
    position: 1,
    notes: "",
  });

  // Fetch links
  const { data: links = [], isLoading, refetch } = trpc.keywords.getAllInternalLinks.useQuery(
    undefined,
    { enabled: true }
  );

  // Mutations
  const addLinkMutation = trpc.keywords.addInternalLink.useMutation({
    onSuccess: () => {
      toast.success("Internal link added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add link: ${error.message}`);
    },
  });

  const deleteLinkMutation = trpc.keywords.deleteInternalLink.useMutation({
    onSuccess: () => {
      toast.success("Internal link deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete link: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      sourcePagePath: "",
      targetPagePath: "",
      anchorText: "",
      linkType: "contextual",
      keywordTarget: "",
      position: 1,
      notes: "",
    });
  };

  const handleAddLink = async () => {
    if (!formData.sourcePagePath || !formData.targetPagePath || !formData.anchorText) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.sourcePagePath === formData.targetPagePath) {
      toast.error("Cannot link a page to itself");
      return;
    }
    await addLinkMutation.mutateAsync(formData);
  };

  const filteredLinks = useMemo(() => {
    return links.filter((link: any) => {
      const matchesSearch =
        link.anchorText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.sourcePagePath?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.targetPagePath?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || link.linkType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [links, searchTerm, selectedType]);

  const linkTypes = ["contextual", "related", "navigation"];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "contextual":
        return "bg-blue-100 text-blue-800";
      case "related":
        return "bg-purple-100 text-purple-800";
      case "navigation":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Internal Link Builder</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage internal links to improve SEO and user navigation
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Internal Link</DialogTitle>
              <DialogDescription>
                Add a new internal link between pages with optimized anchor text
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">From Page Path *</label>
                <Input
                  value={formData.sourcePagePath}
                  onChange={(e) =>
                    setFormData({ ...formData, sourcePagePath: e.target.value })
                  }
                  placeholder="e.g., /services/bim-design"
                />
              </div>
              <div>
                <label className="text-sm font-medium">To Page Path *</label>
                <Input
                  value={formData.targetPagePath}
                  onChange={(e) =>
                    setFormData({ ...formData, targetPagePath: e.target.value })
                  }
                  placeholder="e.g., /services/mepf-design"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Anchor Text *</label>
                <Input
                  value={formData.anchorText}
                  onChange={(e) =>
                    setFormData({ ...formData, anchorText: e.target.value })
                  }
                  placeholder="e.g., BIM design services"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link Type</label>
                <Select
                  value={formData.linkType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      linkType: value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contextual">
                      Contextual (in content)
                    </SelectItem>
                    <SelectItem value="related">Related (sidebar)</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Target Keyword</label>
                <Input
                  value={formData.keywordTarget || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, keywordTarget: e.target.value })
                  }
                  placeholder="Optional: keyword this link targets"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddLink}
                  disabled={addLinkMutation.isPending}
                >
                  {addLinkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Link"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium block mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <label className="text-sm font-medium block mb-2">Link Type</label>
          <Select
            value={selectedType || "all"}
            onValueChange={(value) =>
              setSelectedType(value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {linkTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Links Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {links.length === 0
                ? "No internal links yet. Create your first link to improve SEO!"
                : "No links match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    From Page
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    To Page
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Anchor Text
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Target Keyword
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link: any) => (
                  <tr key={link.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-sm">
                        {link.sourcePagePath}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-sm">
                        {link.targetPagePath}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {link.anchorText}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getTypeColor(link.linkType)}>
                        {link.linkType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {link.keywordTarget ? (
                        <Badge variant="outline">{link.keywordTarget}</Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          deleteLinkMutation.mutateAsync({ id: link.id })
                        }
                        disabled={deleteLinkMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stats */}
      {filteredLinks.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Links</p>
            <p className="text-2xl font-bold">{filteredLinks.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Contextual</p>
            <p className="text-2xl font-bold">
              {filteredLinks.filter((l: any) => l.linkType === "contextual").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Related</p>
            <p className="text-2xl font-bold">
              {filteredLinks.filter((l: any) => l.linkType === "related").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">With Keywords</p>
            <p className="text-2xl font-bold">
              {filteredLinks.filter((l: any) => l.targetKeyword).length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
