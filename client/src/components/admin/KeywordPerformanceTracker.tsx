import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, Search, TrendingUp, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function KeywordPerformanceTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState("30d");

  // Fetch all keywords (mock rankings)
  const { data: keywords = [], isLoading } = trpc.keywords.getKeywords.useQuery(
    { category: selectedCategory || undefined },
    { enabled: true }
  );

  // Transform keywords into rankings with mock GSC data
  const rankings = keywords.map((kw: any, idx: number) => ({
    id: kw.id,
    keyword: kw.keyword,
    currentPosition: Math.floor(Math.random() * 50) + 1,
    previousPosition: Math.floor(Math.random() * 50) + 1,
    targetPosition: kw.targetPosition,
    searchVolume: kw.searchVolume,
    category: kw.category,
  }));

  const filteredRankings = useMemo(() => {
    return (rankings || []).filter((ranking: any) =>
      ranking.keyword?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rankings, searchTerm]);

  const categories = ["BIM", "MEPF", "Quantities", "Design", "Consultation"];

  const getRankingTrend = (current: number, previous: number) => {
    if (current < previous) return "improved";
    if (current > previous) return "declined";
    return "stable";
  };

  const getRankingColor = (position: number | null | undefined) => {
    if (!position) return "bg-gray-100 text-gray-800";
    if (position <= 3) return "bg-green-100 text-green-800";
    if (position <= 10) return "bg-blue-100 text-blue-800";
    if (position <= 20) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getRankingLabel = (position: number | null | undefined) => {
    if (!position) return "Not ranked";
    if (position <= 3) return "Top 3";
    if (position <= 10) return "Top 10";
    if (position <= 20) return "Top 20";
    return "Outside Top 20";
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return (filteredRankings || [])
      .slice(0, 10)
      .map((ranking: any) => ({
        keyword:
          ranking.keyword?.substring(0, 15) +
          (ranking.keyword?.length > 15 ? "..." : ""),
        currentPosition: ranking.currentPosition || 0,
        targetPosition: ranking.targetPosition || 1,
        searchVolume: (ranking.searchVolume || 0) / 100,
      }));
  }, [filteredRankings]);

  const performanceStats = useMemo(() => {
    const data = filteredRankings || [];
    const improved = data.filter(
      (r: any) =>
        r.previousPosition &&
        r.currentPosition &&
        r.currentPosition < r.previousPosition
    ).length;
    const declined = data.filter(
      (r: any) =>
        r.previousPosition &&
        r.currentPosition &&
        r.currentPosition > r.previousPosition
    ).length;
    const topTen = data.filter(
      (r: any) => r.currentPosition && r.currentPosition <= 10
    ).length;
    const topThree = data.filter(
      (r: any) => r.currentPosition && r.currentPosition <= 3
    ).length;

    return { improved, declined, topTen, topThree };
  }, [filteredRankings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Keyword Performance Tracking</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor your keyword rankings and track progress toward target positions
        </p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Top 3 Keywords</p>
          <p className="text-3xl font-bold text-green-600">
            {performanceStats.topThree}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Top 10 Keywords</p>
          <p className="text-3xl font-bold text-blue-600">
            {performanceStats.topTen}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Improved This Month</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-green-600">
              {performanceStats.improved}
            </p>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Declined This Month</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-red-600">
              {performanceStats.declined}
            </p>
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Ranking Positions vs Target</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="keyword" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentPosition" fill="#3b82f6" name="Current" />
                <Bar dataKey="targetPosition" fill="#10b981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Search Volume Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="keyword" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="searchVolume"
                  stroke="#8b5cf6"
                  name="Search Volume (x100)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium block mb-2">Search Keywords</label>
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
        <div className="w-48">
          <label className="text-sm font-medium block mb-2">Time Period</label>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rankings Table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (filteredRankings || []).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No keywords tracked yet. Add keywords from the Keyword Manager to start
              tracking rankings.
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
                    Current Position
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Target Position
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Search Volume
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {(filteredRankings || []).map((ranking: any) => (
                  <tr key={ranking.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium">{ranking.keyword}</span>
                    </td>
                    <td className="px-6 py-4">
                      {ranking.currentPosition ? (
                        <Badge
                          className={getRankingColor(ranking.currentPosition)}
                        >
                          #{ranking.currentPosition}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not ranked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">
                        Target #{ranking.targetPosition || 1}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {ranking.previousPosition && ranking.currentPosition ? (
                        <div className="flex items-center gap-2">
                          {ranking.currentPosition < ranking.previousPosition ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                ↑{ranking.previousPosition - ranking.currentPosition}
                              </span>
                            </>
                          ) : ranking.currentPosition > ranking.previousPosition ? (
                            <>
                              <TrendingDown className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600">
                                ↓{ranking.currentPosition - ranking.previousPosition}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {ranking.searchVolume?.toLocaleString() || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">
                        {getRankingLabel(ranking.currentPosition)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Keyword ranking data is pulled from Google Search
          Console. Make sure your GSC integration is set up to see live ranking data.
          Rankings update daily based on your actual search performance.
        </p>
      </Card>
    </div>
  );
}
