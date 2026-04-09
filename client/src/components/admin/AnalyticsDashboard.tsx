import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Download, Share2, FileText } from "lucide-react";

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  
  // Fetch analytics data
  const trendsQuery = trpc.mepCost.getReportGenerationTrends.useQuery({ days });
  const citiesQuery = trpc.mepCost.getMostUsedCities.useQuery({ limit: 10, days });
  const lodLevelsQuery = trpc.mepCost.getMostUsedLodLevels.useQuery({ limit: 5, days });
  const metricsQuery = trpc.mepCost.getEmailSharingMetrics.useQuery({ days });

  const trends = trendsQuery.data || [];
  const cities = citiesQuery.data || [];
  const lodLevels = lodLevelsQuery.data || [];
  const metrics = metricsQuery.data || { totalReports: 0, emailShares: 0, pdfDownloads: 0, shareRate: 0, downloadRate: 0 };

  const COLORS = ["#ED1C24", "#FF6B6B", "#FFA07A", "#FFB6C1", "#FFC0CB"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track report generation trends and user behavior</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.totalReports}</div>
              <FileText className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Generated in {days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.emailShares}</div>
              <Share2 className="w-8 h-8 text-blue-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metrics.shareRate}% share rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">PDF Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.pdfDownloads}</div>
              <Download className="w-8 h-8 text-green-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metrics.downloadRate}% download rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {Math.round(((metrics.emailShares + metrics.pdfDownloads) / Math.max(metrics.totalReports, 1)) * 100)}%
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total engagement rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Report Generation Trends</CardTitle>
            <CardDescription>MEP and BIM reports generated over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mepCount" stroke="#ED1C24" name="MEP Reports" />
                <Line type="monotone" dataKey="bimCount" stroke="#3B82F6" name="BIM Reports" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sharing vs Downloads */}
        <Card>
          <CardHeader>
            <CardTitle>Sharing vs Downloads</CardTitle>
            <CardDescription>Email shares and PDF downloads trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="emailShares" stroke="#10B981" name="Email Shares" />
                <Line type="monotone" dataKey="pdfDownloads" stroke="#8B5CF6" name="PDF Downloads" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Used Cities */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Cities</CardTitle>
            <CardDescription>Top cities by report generation count</CardDescription>
          </CardHeader>
          <CardContent>
            {cities.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cityName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mepCount" stackId="a" fill="#ED1C24" name="MEP" />
                  <Bar dataKey="bimCount" stackId="a" fill="#3B82F6" name="BIM" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* LOD Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>LOD Level Distribution</CardTitle>
            <CardDescription>Reports by BIM LOD level</CardDescription>
          </CardHeader>
          <CardContent>
            {lodLevels.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lodLevels}
                    dataKey="count"
                    nameKey="lodLevel"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {lodLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cities Table */}
        <Card>
          <CardHeader>
            <CardTitle>City Performance</CardTitle>
            <CardDescription>Detailed metrics by city</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold">City</th>
                    <th className="text-right py-2 px-2 font-semibold">Total</th>
                    <th className="text-right py-2 px-2 font-semibold">MEP</th>
                    <th className="text-right py-2 px-2 font-semibold">BIM</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.slice(0, 5).map((city: any) => (
                    <tr key={city.cityId} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-2 px-2">{city.cityName}</td>
                      <td className="text-right py-2 px-2 font-medium">{city.count}</td>
                      <td className="text-right py-2 px-2">{city.mepCount}</td>
                      <td className="text-right py-2 px-2">{city.bimCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* LOD Levels Table */}
        <Card>
          <CardHeader>
            <CardTitle>LOD Level Performance</CardTitle>
            <CardDescription>Reports and average cost by LOD level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold">LOD Level</th>
                    <th className="text-right py-2 px-2 font-semibold">Count</th>
                    <th className="text-right py-2 px-2 font-semibold">Avg Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {lodLevels.map((lod: any) => (
                    <tr key={lod.lodLevel} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-2 px-2 font-medium">LOD {lod.lodLevel}</td>
                      <td className="text-right py-2 px-2">{lod.count}</td>
                      <td className="text-right py-2 px-2">₹{(lod.avgCost / 100000).toFixed(1)}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Analytics Note</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p>
            Analytics data is populated as users generate reports and share them via email or download as PDF. 
            The dashboard shows trends over the selected time period to help you understand user behavior patterns 
            and optimize your pricing strategy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
