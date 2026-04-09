import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";

export function GSCDashboard() {
  const [isSubmittingSitemap, setIsSubmittingSitemap] = useState(false);
  const [sitemapMessage, setSitemapMessage] = useState("");

  const authStatus = trpc.gsc.getAuthStatus.useQuery();
  const searchPerformance = trpc.gsc.getSearchPerformance.useQuery();
  const indexingStatus = trpc.gsc.getIndexingStatus.useQuery();
  const coverageReport = trpc.gsc.getCoverageReport.useQuery();
  const submitSitemap = trpc.gsc.submitSitemap.useMutation();

  const handleSubmitSitemap = async () => {
    setIsSubmittingSitemap(true);
    try {
      const result = await submitSitemap.mutateAsync({
        sitemapUrl: `${window.location.origin}/sitemap.xml`,
      });
      setSitemapMessage("✓ Sitemap submission queued successfully!");
      setTimeout(() => setSitemapMessage(""), 5000);
    } catch (error) {
      setSitemapMessage("✗ Failed to submit sitemap");
    } finally {
      setIsSubmittingSitemap(false);
    }
  };

  const performanceData = searchPerformance.data?.topQueries || [];
  const coverageData = [
    { name: "Valid", value: coverageReport.data?.valid || 0, fill: "#10b981" },
    { name: "Warning", value: coverageReport.data?.warning || 0, fill: "#f59e0b" },
    { name: "Error", value: coverageReport.data?.error || 0, fill: "#ef4444" },
    { name: "Excluded", value: coverageReport.data?.excluded || 0, fill: "#6b7280" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Google Search Console</h2>
          <p className="text-muted-foreground">Monitor your site's search performance and indexing status</p>
        </div>
        <Button onClick={() => searchPerformance.refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Authentication Status */}
      {!authStatus.data?.authenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Google Search Console is not connected. Connect to access performance data.</span>
              <Button size="sm" variant="outline" asChild>
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                  Go to GSC <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sitemap Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Sitemap Management</CardTitle>
          <CardDescription>Submit and manage your XML sitemap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sitemapMessage && (
            <Alert className={sitemapMessage.includes("✓") ? "border-green-500" : "border-red-500"}>
              <AlertDescription className={sitemapMessage.includes("✓") ? "text-green-700" : "text-red-700"}>
                {sitemapMessage}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <p className="text-sm font-medium">Sitemap URL</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/sitemap.xml`}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted"
              />
              <Button
                onClick={handleSubmitSitemap}
                disabled={isSubmittingSitemap}
              >
                {isSubmittingSitemap ? "Submitting..." : "Submit to GSC"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your sitemap is automatically generated and updated. Submit it to Google Search Console to ensure all pages are indexed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="indexing">Indexing</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{searchPerformance.data?.impressions || 0}</div>
                <p className="text-xs text-muted-foreground">Times shown in search</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{searchPerformance.data?.clicks || 0}</div>
                <p className="text-xs text-muted-foreground">Clicks from search</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(searchPerformance.data?.ctr || 0).toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Click-through rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(searchPerformance.data?.avgPosition || 0).toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Average ranking position</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Queries Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Search Queries</CardTitle>
              <CardDescription>Your best performing search queries</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="query" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#ef4444" name="Clicks" />
                  <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Pages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Pages with the most search traffic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Page</th>
                      <th className="text-right py-2 px-2">Clicks</th>
                      <th className="text-right py-2 px-2">Impressions</th>
                      <th className="text-right py-2 px-2">CTR</th>
                      <th className="text-right py-2 px-2">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchPerformance.data?.topPages?.map((page: any) => (
                      <tr key={page.page} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 font-medium">{page.page}</td>
                        <td className="text-right py-2 px-2">{page.clicks}</td>
                        <td className="text-right py-2 px-2">{page.impressions}</td>
                        <td className="text-right py-2 px-2">{(page.ctr).toFixed(2)}%</td>
                        <td className="text-right py-2 px-2">{page.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Coverage Summary</CardTitle>
                <CardDescription>Page indexing status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={coverageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {coverageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {coverageReport.data?.details?.valid?.map((item: any) => (
                  <div key={item.issue} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">{item.issue}</span>
                    <span className="font-bold text-green-700">{item.count}</span>
                  </div>
                ))}
                {coverageReport.data?.details?.warning?.map((item: any) => (
                  <div key={item.issue} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">{item.issue}</span>
                    <span className="font-bold text-yellow-700">{item.count}</span>
                  </div>
                ))}
                {coverageReport.data?.details?.error?.map((item: any) => (
                  <div key={item.issue} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm">{item.issue}</span>
                    <span className="font-bold text-red-700">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Indexing Tab */}
        <TabsContent value="indexing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{indexingStatus.data?.indexed || 0}</div>
                <p className="text-xs text-muted-foreground">Successfully indexed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Not Indexed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{indexingStatus.data?.notIndexed || 0}</div>
                <p className="text-xs text-muted-foreground">Pending indexing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Excluded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{indexingStatus.data?.excluded || 0}</div>
                <p className="text-xs text-muted-foreground">Excluded from index</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indexing Issues</CardTitle>
              <CardDescription>Problems preventing pages from being indexed</CardDescription>
            </CardHeader>
            <CardContent>
              {indexingStatus.data?.issues && indexingStatus.data.issues.length > 0 ? (
                <div className="space-y-3">
                  {indexingStatus.data.issues.map((issue: any) => (
                    <div key={issue.type} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{issue.type}</h4>
                        <span className="text-sm font-bold text-red-600">{issue.count} issue(s)</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {issue.pages?.map((page: string) => (
                          <div key={page} className="text-xs">• {page}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">No indexing issues detected!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* GSC Link */}
      <Card>
        <CardHeader>
          <CardTitle>Full GSC Access</CardTitle>
          <CardDescription>For advanced features and detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              Open Google Search Console <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
