"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface EmailLog {
  id: number;
  recipientEmail: string;
  subject: string;
  emailType: string;
  status: "sent" | "failed" | "pending";
  sentAt: Date;
  errorMessage?: string;
}

interface AnalyticsData {
  totalSent: number;
  totalFailed: number;
  successRate: number;
  avgDeliveryTime: number;
  dailyStats: Array<{ date: string; sent: number; failed: number }>;
  emailLogs: EmailLog[];
}

export function EmailAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSent: 0,
    totalFailed: 0,
    successRate: 0,
    avgDeliveryTime: 0,
    dailyStats: [],
    emailLogs: [],
  });

  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "sent" | "failed">("all");
  const [searchEmail, setSearchEmail] = useState("");

  // Fetch email analytics from backend
  const emailAnalyticsQuery = trpc.email.getAnalytics?.useQuery?.() || { data: null, isLoading: false };
  const emailLogsQuery = trpc.email.getLogs?.useQuery?.({ limit: 100 }) || { data: null, isLoading: false };

  useEffect(() => {
    if (emailAnalyticsQuery?.data && emailLogsQuery?.data) {
      const logs = emailLogsQuery.data || [];
      const totalSent = logs.filter((l) => l.status === "sent").length;
      const totalFailed = logs.filter((l) => l.status === "failed").length;
      const successRate = totalSent > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0;

      setAnalytics({
        totalSent,
        totalFailed,
        successRate,
        avgDeliveryTime: 0,
        dailyStats: emailAnalyticsQuery.data.dailyStats || [],
        emailLogs: logs,
      });
      setLoading(false);
    }
  }, [emailAnalyticsQuery.data, emailLogsQuery.data]);

  const filteredLogs = analytics.emailLogs.filter((log) => {
    if (filterType !== "all" && log.status !== filterType) return false;
    if (searchEmail && !log.recipientEmail.includes(searchEmail)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail size={16} />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.totalSent}</p>
            <p className="text-xs text-muted-foreground">emails sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{analytics.totalFailed}</p>
            <p className="text-xs text-muted-foreground">delivery failures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={16} />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{analytics.successRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">delivery success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock size={16} />
              Avg Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.avgDeliveryTime}ms</p>
            <p className="text-xs text-muted-foreground">average delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analytics.dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Email Stats</CardTitle>
            <CardDescription>Email delivery trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#ED1C24" />
                <Bar dataKey="failed" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Email Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
          <CardDescription>Recent email delivery history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search" className="text-xs">Search Email</Label>
              <Input
                id="search"
                placeholder="Search by recipient email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1 min-w-48">
              <Label htmlFor="filter" className="text-xs">Filter by Status</Label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-2 px-3">Recipient</th>
                  <th className="text-left py-2 px-3">Subject</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-2 px-3 text-xs">{log.recipientEmail}</td>
                      <td className="py-2 px-3 text-xs truncate">{log.subject}</td>
                      <td className="py-2 px-3 text-xs">{log.emailType}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          log.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : log.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs">{new Date(log.sentAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No email logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
