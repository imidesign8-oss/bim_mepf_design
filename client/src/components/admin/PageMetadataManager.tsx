import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Eye, Save, Search, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PageMetadata {
  id?: number;
  pageSlug: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  keywords?: string;
  robots?: string;
}

export function PageMetadataManager() {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const getAllMetadata = trpc.pageMetadata.getAll.useQuery();
  const upsertMetadata = trpc.pageMetadata.upsert.useMutation();
  const deleteMetadata = trpc.pageMetadata.delete.useMutation();
  const getStats = trpc.pageMetadata.getStats.useQuery();

  useEffect(() => {
    if (getAllMetadata.data) {
      setPages(getAllMetadata.data);
      if (!selectedPage && getAllMetadata.data.length > 0) {
        setSelectedPage(getAllMetadata.data[0]);
      }
    }
  }, [getAllMetadata.data]);

  const filteredPages = pages.filter(p =>
    p.pageSlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedPage) return;
    setIsLoading(true);
    try {
      await upsertMetadata.mutateAsync({
        pageSlug: selectedPage.pageSlug,
        metaTitle: selectedPage.metaTitle,
        metaDescription: selectedPage.metaDescription,
        ogTitle: selectedPage.ogTitle,
        ogDescription: selectedPage.ogDescription,
        ogImage: selectedPage.ogImage,
        ogImageAlt: selectedPage.ogImageAlt,
        twitterCard: selectedPage.twitterCard,
        twitterImage: selectedPage.twitterImage,
        canonicalUrl: selectedPage.canonicalUrl,
        keywords: selectedPage.keywords,
        robots: selectedPage.robots,
      });
      setSaveMessage("✓ Metadata saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      getAllMetadata.refetch();
    } catch (error) {
      setSaveMessage("✗ Failed to save metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage) return;
    if (!confirm(`Delete metadata for ${selectedPage.pageSlug}?`)) return;
    
    try {
      await deleteMetadata.mutateAsync({ slug: selectedPage.pageSlug });
      setPages(pages.filter(p => p.pageSlug !== selectedPage.pageSlug));
      setSelectedPage(null);
      getAllMetadata.refetch();
    } catch (error) {
      console.error("Failed to delete metadata:", error);
    }
  };

  const updateField = (field: keyof PageMetadata, value: string) => {
    if (!selectedPage) return;
    setSelectedPage({ ...selectedPage, [field]: value });
  };

  const metaDescLength = selectedPage?.metaDescription?.length || 0;
  const metaDescStatus = metaDescLength === 0 ? "empty" : metaDescLength < 50 ? "short" : metaDescLength > 160 ? "long" : "good";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
            <p className="text-xs text-muted-foreground">Tracked pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">OG Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStats.data?.withOgImage || 0}</div>
            <p className="text-xs text-muted-foreground">{getStats.data?.coverage?.ogImage || 0}% coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meta Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStats.data?.withMetaDesc || 0}</div>
            <p className="text-xs text-muted-foreground">{getStats.data?.coverage?.metaDescription || 0}% coverage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pages List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Pages</CardTitle>
            <CardDescription>Select a page to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPages.map((page) => (
                <button
                  key={page.pageSlug}
                  onClick={() => setSelectedPage(page)}
                  className={`w-full text-left p-2 rounded text-sm transition ${
                    selectedPage?.pageSlug === page.pageSlug
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium truncate">{page.pageSlug}</div>
                  {page.metaDescription && (
                    <div className="text-xs opacity-75 truncate">{page.metaDescription}</div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedPage?.pageSlug || "Select a page"}</CardTitle>
                <CardDescription>Edit SEO metadata and social sharing tags</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide" : "Preview"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedPage ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Select a page from the list to edit</AlertDescription>
              </Alert>
            ) : (
              <>
                {saveMessage && (
                  <Alert className={saveMessage.includes("✓") ? "border-green-500" : "border-red-500"}>
                    <AlertDescription className={saveMessage.includes("✓") ? "text-green-700" : "text-red-700"}>
                      {saveMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs defaultValue="meta" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="meta">Meta Tags</TabsTrigger>
                    <TabsTrigger value="og">Open Graph</TabsTrigger>
                    <TabsTrigger value="twitter">Twitter</TabsTrigger>
                  </TabsList>

                  <TabsContent value="meta" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Meta Title</label>
                      <Input
                        value={selectedPage.metaTitle || ""}
                        onChange={(e) => updateField("metaTitle", e.target.value)}
                        placeholder="Page title for search results (50-60 chars)"
                        maxLength={60}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{selectedPage.metaTitle?.length || 0}/60</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Meta Description</label>
                      <Textarea
                        value={selectedPage.metaDescription || ""}
                        onChange={(e) => updateField("metaDescription", e.target.value)}
                        placeholder="Page description for search results (50-160 chars)"
                        maxLength={160}
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{metaDescLength}/160</p>
                        <span className={`text-xs font-medium ${
                          metaDescStatus === "good" ? "text-green-600" :
                          metaDescStatus === "empty" ? "text-gray-600" :
                          metaDescStatus === "short" ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {metaDescStatus === "good" ? "✓ Good" :
                           metaDescStatus === "empty" ? "Empty" :
                           metaDescStatus === "short" ? "Too short" : "Too long"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Keywords</label>
                      <Input
                        value={selectedPage.keywords || ""}
                        onChange={(e) => updateField("keywords", e.target.value)}
                        placeholder="Comma-separated keywords"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Robots</label>
                      <Input
                        value={selectedPage.robots || ""}
                        onChange={(e) => updateField("robots", e.target.value)}
                        placeholder="e.g., index, follow"
                        defaultValue="index, follow"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Canonical URL</label>
                      <Input
                        value={selectedPage.canonicalUrl || ""}
                        onChange={(e) => updateField("canonicalUrl", e.target.value)}
                        placeholder="https://example.com/page"
                        type="url"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="og" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">OG Title</label>
                      <Input
                        value={selectedPage.ogTitle || ""}
                        onChange={(e) => updateField("ogTitle", e.target.value)}
                        placeholder="Title for social sharing"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">OG Description</label>
                      <Textarea
                        value={selectedPage.ogDescription || ""}
                        onChange={(e) => updateField("ogDescription", e.target.value)}
                        placeholder="Description for social sharing"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">OG Image URL</label>
                      <Input
                        value={selectedPage.ogImage || ""}
                        onChange={(e) => updateField("ogImage", e.target.value)}
                        placeholder="https://cdn.example.com/image.jpg"
                        type="url"
                      />
                      {selectedPage.ogImage && (
                        <div className="mt-2">
                          <img
                            src={selectedPage.ogImage}
                            alt="OG Preview"
                            className="w-full h-40 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">OG Image Alt Text</label>
                      <Input
                        value={selectedPage.ogImageAlt || ""}
                        onChange={(e) => updateField("ogImageAlt", e.target.value)}
                        placeholder="Alt text for accessibility"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="twitter" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Twitter Card Type</label>
                      <select
                        value={selectedPage.twitterCard || "summary_large_image"}
                        onChange={(e) => updateField("twitterCard", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                        <option value="app">App</option>
                        <option value="player">Player</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Twitter Image URL</label>
                      <Input
                        value={selectedPage.twitterImage || ""}
                        onChange={(e) => updateField("twitterImage", e.target.value)}
                        placeholder="https://cdn.example.com/twitter-image.jpg"
                        type="url"
                      />
                      {selectedPage.twitterImage && (
                        <div className="mt-2">
                          <img
                            src={selectedPage.twitterImage}
                            alt="Twitter Preview"
                            className="w-full h-40 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
