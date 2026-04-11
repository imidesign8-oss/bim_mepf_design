import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, RefreshCw, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function SEORecommendations() {
  const [isAuditing, setIsAuditing] = useState(false);

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = trpc.seoAudit.getHealthOverview.useQuery();
  const { data: allAudits, isLoading: auditsLoading, refetch: refetchAudits } = trpc.seoAudit.getAllPageAudits.useQuery();
  const auditAllMutation = trpc.seoAudit.auditAllPages.useMutation();

  const handleAuditAll = async () => {
    setIsAuditing(true);
    try {
      await auditAllMutation.mutateAsync();
      await refetchHealth();
      await refetchAudits();
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setIsAuditing(false);
    }
  };

  const getPriorityColor = (severity: string) => {
    switch (severity) {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-yellow-50";
    return "bg-red-50";
  };

  // Show loading state
  if (healthLoading || auditsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>SEO Health Overview</CardTitle>
            <CardDescription>Loading SEO data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no audits exist
  if (!healthData?.success || !allAudits?.audits || allAudits.audits.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SEO Health Overview</span>
              <Button
                onClick={handleAuditAll}
                disabled={isAuditing}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isAuditing ? "Auditing..." : "Run Full Audit"}
              </Button>
            </CardTitle>
            <CardDescription>
              No SEO audits have been run yet. Click "Run Full Audit" to analyze your pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-300 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Getting Started:</strong> Click the "Run Full Audit" button above to analyze all pages for SEO issues. This will check meta descriptions, titles, headings, images, and more.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      {healthData?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SEO Health Overview</span>
              <Button
                onClick={handleAuditAll}
                disabled={isAuditing}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isAuditing ? "Auditing..." : "Run Full Audit"}
              </Button>
            </CardTitle>
            <CardDescription>
              Overall SEO performance across all pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${getScoreBg(healthData?.health?.overallScore || 0)}`}>
                <div className="text-sm font-medium text-gray-600 mb-1">Overall Score</div>
                <div className={`text-3xl font-bold ${getScoreColor(healthData?.health?.overallScore || 0)}`}>
                  {healthData?.health?.overallScore || 0}/100
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="text-sm font-medium text-gray-600 mb-1">Pages Audited</div>
                <div className="text-3xl font-bold text-blue-600">
                  {healthData?.health?.totalPages || 0}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-orange-50">
                <div className="text-sm font-medium text-gray-600 mb-1">Needs Work</div>
                <div className="text-3xl font-bold text-orange-600">
                  {healthData?.health?.pagesNeedingWork || 0}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50">
                <div className="text-sm font-medium text-gray-600 mb-1">Critical</div>
                <div className="text-3xl font-bold text-red-600">
                  {healthData?.health?.criticalPages || 0}
                </div>
              </div>
            </div>

            {/* Issue Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Issues by Severity</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(allAudits?.statistics?.criticalIssues || 0) / 10 * 100} className="w-24" />
                    <span className="text-sm font-medium">{allAudits?.statistics?.criticalIssues || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">High</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(allAudits?.statistics?.highIssues || 0) / 10 * 100} className="w-24" />
                    <span className="text-sm font-medium">{allAudits?.statistics?.highIssues || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medium</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(allAudits?.statistics?.mediumIssues || 0) / 10 * 100} className="w-24" />
                    <span className="text-sm font-medium">{allAudits?.statistics?.mediumIssues || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(allAudits?.statistics?.lowIssues || 0) / 10 * 100} className="w-24" />
                    <span className="text-sm font-medium">{allAudits?.statistics?.lowIssues || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Recommendations */}
            {healthData?.topRecommendations && healthData.topRecommendations.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-sm">Top Recommendations</h3>
                <div className="space-y-2">
                  {healthData.topRecommendations.map((rec: any, idx: number) => (
                    <Alert key={idx} className="border-orange-300 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-sm text-orange-800">
                        {typeof rec === "string" ? rec : rec?.recommendation || "SEO improvement needed"}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Page Scores */}
      {allAudits?.audits && allAudits.audits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Page SEO Scores</CardTitle>
            <CardDescription>
              Individual page performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allAudits.audits.map((audit: any) => (
                <div key={audit.pagePath} className={`p-4 rounded-lg border ${getScoreBg(audit.score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{audit.pagePath}</span>
                    <span className={`text-lg font-bold ${getScoreColor(audit.score)}`}>
                      {audit.score}/100
                    </span>
                  </div>
                  <Progress value={audit.score} className="h-2" />
                  <div className="flex gap-2 mt-2 text-xs">
                    {audit.issues && (
                      <>
                        {audit.issues.filter((i: any) => i.severity === "critical").length > 0 && (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700">
                            {audit.issues.filter((i: any) => i.severity === "critical").length} Critical
                          </span>
                        )}
                        {audit.issues.filter((i: any) => i.severity === "high").length > 0 && (
                          <span className="px-2 py-1 rounded bg-orange-100 text-orange-700">
                            {audit.issues.filter((i: any) => i.severity === "high").length} High
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Issues */}
      {allAudits?.audits && allAudits.audits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Issues</CardTitle>
            <CardDescription>
              All SEO issues by category and severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="high">High</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {allAudits.audits.flatMap((audit: any) =>
                  audit.issues?.map((issue: any, idx: number) => (
                    <div key={`${audit.pagePath}-${idx}`} className={`p-4 rounded-lg border ${getPriorityColor(issue.severity)}`}>
                      <div className="flex items-start gap-3">
                        {issue.severity === "critical" && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        {issue.severity === "high" && <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        {issue.severity === "medium" && <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        {issue.severity === "low" && <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">{issue.issue}</div>
                          <div className="text-xs mb-2 opacity-75">{issue.category} • {audit.pagePath}</div>
                          <div className="text-xs mb-2">{issue.recommendation}</div>
                          <div className="text-xs opacity-70">Impact: {issue.impact}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {allAudits.audits.every((a: any) => !a.issues || a.issues.length === 0) && (
                  <Alert className="border-green-300 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      No SEO issues found! Your pages are well-optimized.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="critical" className="space-y-3 mt-4">
                {allAudits.audits.flatMap((audit: any) =>
                  audit.issues
                    ?.filter((i: any) => i.severity === "critical")
                    .map((issue: any, idx: number) => (
                      <div key={`${audit.pagePath}-${idx}`} className={`p-4 rounded-lg border ${getPriorityColor(issue.severity)}`}>
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{issue.issue}</div>
                            <div className="text-xs mb-2 opacity-75">{issue.category} • {audit.pagePath}</div>
                            <div className="text-xs mb-2">{issue.recommendation}</div>
                            <div className="text-xs opacity-70">Impact: {issue.impact}</div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
                {!allAudits.audits.some((a: any) => a.issues?.some((i: any) => i.severity === "critical")) && (
                  <Alert className="border-green-300 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      No critical issues found!
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="high" className="space-y-3 mt-4">
                {allAudits.audits.flatMap((audit: any) =>
                  audit.issues
                    ?.filter((i: any) => i.severity === "high")
                    .map((issue: any, idx: number) => (
                      <div key={`${audit.pagePath}-${idx}`} className={`p-4 rounded-lg border ${getPriorityColor(issue.severity)}`}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{issue.issue}</div>
                            <div className="text-xs mb-2 opacity-75">{issue.category} • {audit.pagePath}</div>
                            <div className="text-xs mb-2">{issue.recommendation}</div>
                            <div className="text-xs opacity-70">Impact: {issue.impact}</div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
                {!allAudits.audits.some((a: any) => a.issues?.some((i: any) => i.severity === "high")) && (
                  <Alert className="border-green-300 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      No high priority issues found!
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="medium" className="space-y-3 mt-4">
                {allAudits.audits.flatMap((audit: any) =>
                  audit.issues
                    ?.filter((i: any) => i.severity === "medium")
                    .map((issue: any, idx: number) => (
                      <div key={`${audit.pagePath}-${idx}`} className={`p-4 rounded-lg border ${getPriorityColor(issue.severity)}`}>
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">{issue.issue}</div>
                            <div className="text-xs mb-2 opacity-75">{issue.category} • {audit.pagePath}</div>
                            <div className="text-xs mb-2">{issue.recommendation}</div>
                            <div className="text-xs opacity-70">Impact: {issue.impact}</div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
                {!allAudits.audits.some((a: any) => a.issues?.some((i: any) => i.severity === "medium")) && (
                  <Alert className="border-green-300 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      No medium priority issues found!
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
