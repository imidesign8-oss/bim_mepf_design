import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, RefreshCw, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function SEORecommendations() {
  const [selectedPage, setSelectedPage] = useState<string>("/");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePage = trpc.seoAudit.analyzePage.useQuery(
    { pageSlug: selectedPage },
    { enabled: !!selectedPage }
  );
  const auditAllPages = trpc.seoAudit.auditAllPages.useQuery();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await analyzePage.refetch();
    setIsAnalyzing(false);
  };

  const recommendations = analyzePage.data?.recommendations || [];
  const summary = analyzePage.data?.summary;

  const criticalIssues = recommendations.filter(r => r.priority === "critical");
  const highIssues = recommendations.filter(r => r.priority === "high");
  const mediumIssues = recommendations.filter(r => r.priority === "medium");
  const lowIssues = recommendations.filter(r => r.priority === "low");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "fail":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Recommendations</h2>
          <p className="text-muted-foreground">Get actionable suggestions to improve your SEO</p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </Button>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Page</TabsTrigger>
          <TabsTrigger value="all">All Pages</TabsTrigger>
        </TabsList>

        {/* Single Page Analysis */}
        <TabsContent value="single" className="space-y-6">
          {/* Page Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Page to Analyze</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="/">Home</option>
                <option value="/about">About</option>
                <option value="/services">Services</option>
                <option value="/services/bim-design">BIM Design Service</option>
                <option value="/services/mepf-design">MEPF Design Service</option>
                <option value="/projects">Projects</option>
                <option value="/blog">Blog</option>
                <option value="/contact">Contact</option>
              </select>
            </CardContent>
          </Card>

          {/* SEO Score */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Score</CardTitle>
                <CardDescription>Overall page optimization score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-primary">{summary.score}/100</span>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {summary.critical} Critical • {summary.high} High • {summary.medium} Medium
                    </p>
                  </div>
                </div>
                <Progress value={summary.score} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {summary.score >= 80
                    ? "Great job! Your page is well optimized."
                    : summary.score >= 60
                    ? "Good progress. Follow the recommendations below to improve further."
                    : "Significant improvements needed. Focus on critical issues first."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations by Priority */}
          {criticalIssues.length > 0 && (
            <Card className="border-red-300">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="h-5 w-5" />
                  Critical Issues ({criticalIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {criticalIssues.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 bg-red-50">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(rec.status)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900">{rec.title}</h4>
                        <p className="text-sm text-red-800 mt-1">{rec.description}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-red-900">Impact: {rec.impact}</p>
                          <p className="text-xs text-red-800">💡 {rec.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {highIssues.length > 0 && (
            <Card className="border-orange-300">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <AlertTriangle className="h-5 w-5" />
                  High Priority ({highIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {highIssues.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 bg-orange-50">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(rec.status)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-900">{rec.title}</h4>
                        <p className="text-sm text-orange-800 mt-1">{rec.description}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-orange-900">Impact: {rec.impact}</p>
                          <p className="text-xs text-orange-800">💡 {rec.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {mediumIssues.length > 0 && (
            <Card className="border-yellow-300">
              <CardHeader className="bg-yellow-50">
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertTriangle className="h-5 w-5" />
                  Medium Priority ({mediumIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {mediumIssues.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 bg-yellow-50">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(rec.status)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900">{rec.title}</h4>
                        <p className="text-sm text-yellow-800 mt-1">{rec.description}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-yellow-900">Impact: {rec.impact}</p>
                          <p className="text-xs text-yellow-800">💡 {rec.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {lowIssues.length > 0 && (
            <Card className="border-blue-300">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CheckCircle2 className="h-5 w-5" />
                  Optimizations ({lowIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {lowIssues.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3 bg-blue-50">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(rec.status)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">{rec.title}</h4>
                        <p className="text-sm text-blue-800 mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {recommendations.length === 0 && !analyzePage.isLoading && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                No recommendations available. Click "Analyze" to get started.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* All Pages Audit */}
        <TabsContent value="all" className="space-y-6">
          {auditAllPages.data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{auditAllPages.data.summary.totalPages}</div>
                    <p className="text-xs text-muted-foreground">Analyzed pages</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{auditAllPages.data.summary.avgScore}/100</div>
                    <p className="text-xs text-muted-foreground">Overall SEO health</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pages with Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{auditAllPages.data.summary.pagesWithIssues}</div>
                    <p className="text-xs text-muted-foreground">Need attention</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Page Scores</CardTitle>
                  <CardDescription>SEO scores for all pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditAllPages.data.results.map((result: any) => (
                      <div key={result.page} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{result.page}</p>
                          <p className="text-xs text-muted-foreground">{result.issues} issue(s)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={result.score} className="w-24 h-2" />
                          <span className="font-bold text-sm w-12 text-right">{result.score}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
