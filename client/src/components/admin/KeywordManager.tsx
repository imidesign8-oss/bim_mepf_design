import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Edit2, Search, Filter } from "lucide-react";
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

interface KeywordFormData {
  keyword: string;
  category?: string;
  searchVolume?: number;
  difficulty?: number;
  targetPosition?: number;
  notes?: string;
}

export function KeywordManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<KeywordFormData>({
    keyword: "",
    category: "BIM",
    searchVolume: 0,
    difficulty: 50,
    targetPosition: 1,
    notes: "",
  });

  // Fetch keywords
  const { data: keywords = [], isLoading, refetch } = trpc.keywords.getKeywords.useQuery(
    { category: selectedCategory || undefined },
    { enabled: true }
  );

  // Mutations
  const addKeywordMutation = trpc.keywords.addKeyword.useMutation({
    onSuccess: () => {
      toast.success("Keyword added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add keyword: ${error.message}`);
    },
  });

  const updateKeywordMutation = trpc.keywords.updateKeyword.useMutation({
    onSuccess: () => {
      toast.success("Keyword updated successfully");
      setEditingId(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update keyword: ${error.message}`);
    },
  });

  const deleteKeywordMutation = trpc.keywords.deleteKeyword.useMutation({
    onSuccess: () => {
      toast.success("Keyword deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete keyword: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      keyword: "",
      category: "BIM",
      searchVolume: 0,
      difficulty: 50,
      targetPosition: 1,
      notes: "",
    });
  };

  const handleAddKeyword = async () => {
    if (!formData.keyword.trim()) {
      toast.error("Keyword cannot be empty");
      return;
    }
    await addKeywordMutation.mutateAsync(formData);
  };

  const handleUpdateKeyword = async () => {
    if (!editingId) return;
    if (!formData.keyword.trim()) {
      toast.error("Keyword cannot be empty");
      return;
    }
    await updateKeywordMutation.mutateAsync({
      id: editingId,
      ...formData,
    });
  };

  const handleEditKeyword = (keyword: any) => {
    setEditingId(keyword.id);
    setFormData({
      keyword: keyword.keyword,
      category: keyword.category,
      searchVolume: keyword.searchVolume,
      difficulty: keyword.difficulty,
      targetPosition: keyword.targetPosition,
      notes: keyword.notes,
    });
  };

  const filteredKeywords = useMemo(() => {
    return keywords.filter((kw: any) =>
      kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [keywords, searchTerm]);

  const categories = ["BIM", "MEPF", "Quantities", "Design", "Consultation"];

  const getDifficultyColor = (difficulty: number | null | undefined) => {
    if (!difficulty) return "bg-gray-100";
    if (difficulty < 30) return "bg-green-100";
    if (difficulty < 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getDifficultyLabel = (difficulty: number | null | undefined) => {
    if (!difficulty) return "Unknown";
    if (difficulty < 30) return "Easy";
    if (difficulty < 60) return "Medium";
    return "Hard";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Keyword Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage target keywords for your website
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Keyword
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Keyword" : "Add New Keyword"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the keyword details"
                  : "Add a new target keyword to track"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Keyword *</label>
                <Input
                  value={formData.keyword}
                  onChange={(e) =>
                    setFormData({ ...formData, keyword: e.target.value })
                  }
                  placeholder="e.g., BIM design services"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category || "BIM"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Search Volume</label>
                  <Input
                    type="number"
                    value={formData.searchVolume || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        searchVolume: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="e.g., 1200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Difficulty (0-100)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.difficulty || 50}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: parseInt(e.target.value) || 50,
                      })
                    }
                    placeholder="e.g., 45"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Target Position</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.targetPosition || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetPosition: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="e.g., 1"
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
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingId ? handleUpdateKeyword : handleAddKeyword}
                  disabled={
                    addKeywordMutation.isPending ||
                    updateKeywordMutation.isPending
                  }
                >
                  {addKeywordMutation.isPending ||
                  updateKeywordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Keyword"
                  ) : (
                    "Add Keyword"
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
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <label className="text-sm font-medium block mb-2">Category</label>
          <Select
            value={selectedCategory || "all"}
            onValueChange={(value) =>
              setSelectedCategory(value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Keywords Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {keywords.length === 0
                ? "No keywords yet. Add your first keyword to get started!"
                : "No keywords match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Keyword
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Search Volume
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Target Position
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.map((keyword: any) => (
                  <tr key={keyword.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium">{keyword.keyword}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{keyword.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {keyword.searchVolume?.toLocaleString() || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                          keyword.difficulty
                        )}`}
                      >
                        {getDifficultyLabel(keyword.difficulty)} (
                        {keyword.difficulty || 0})
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        Position {keyword.targetPosition || 1}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleEditKeyword(keyword);
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            deleteKeywordMutation.mutateAsync({ id: keyword.id })
                          }
                          disabled={deleteKeywordMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stats */}
      {filteredKeywords.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Keywords</p>
            <p className="text-2xl font-bold">{filteredKeywords.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Avg. Difficulty</p>
            <p className="text-2xl font-bold">
              {Math.round(
                filteredKeywords.reduce((sum: number, kw: any) => sum + (kw.difficulty || 0), 0) /
                  filteredKeywords.length
              )}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Search Volume</p>
            <p className="text-2xl font-bold">
              {(
                filteredKeywords.reduce((sum: number, kw: any) => sum + (kw.searchVolume || 0), 0) /
                1000
              ).toFixed(1)}
              K
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Easy Keywords</p>
            <p className="text-2xl font-bold">
              {filteredKeywords.filter((kw: any) => (kw.difficulty || 0) < 30).length}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
