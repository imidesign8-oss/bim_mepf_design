import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // In a real app, fetch from your backend
      // For now, generate mock data
      const mockLogs: EmailLog[] = [
        {
          id: 1,
          recipientEmail: "client@example.com",
          subject: "We've Received Your Inquiry",
          emailType: "contact_submission",
          status: "sent",
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: 2,
          recipientEmail: "admin@imidesign.in",
          subject: "New Contact Form Submission",
          emailType: "contact_submission",
          status: "sent",
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: 3,
          recipientEmail: "invalid@example.com",
          subject: "We've Received Your Inquiry",
          emailType: "contact_submission",
          status: "failed",
          sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          errorMessage: "Invalid email address",
        },
      ];

      const totalSent = mockLogs.filter((l) => l.status === "sent").length;
      const totalFailed = mockLogs.filter((l) => l.status === "failed").length;
      const successRate = totalSent / (totalSent + totalFailed);

      const dailyStats = [
        { date: "Mon", sent: 12, failed: 2 },
        { date: "Tue", sent: 15, failed: 1 },
        { date: "Wed", sent: 18, failed: 3 },
        { date: "Thu", sent: 14, failed: 2 },
        { date: "Fri", sent: 20, failed: 1 },
        { date: "Sat", sent: 8, failed: 0 },
        { date: "Sun", sent: 5, failed: 1 },
      ];

      setAnalytics({
        totalSent,
        totalFailed,
        successRate: Math.round(successRate * 100),
        avgDeliveryTime: 1.2,
        dailyStats,
        emailLogs: mockLogs,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = analytics.emailLogs.filter((log) => {
    if (filterType !== "all" && log.status !== filterType) return false;
    if (searchEmail && !log.recipientEmail.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{analytics.totalSent}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{analytics.totalFailed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{analytics.successRate}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Delivery</p>
                <p className="text-2xl font-bold">{analytics.avgDeliveryTime}s</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Email Delivery Trend</CardTitle>
          <CardDescription>Last 7 days email delivery statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#10b981" name="Sent" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Email Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
          <CardDescription>Recent email delivery history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Email</Label>
              <Input
                id="search"
                placeholder="Search by email address..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Filter</Label>
              <div className="flex gap-2 mt-1">
                {(["all", "sent", "failed"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    onClick={() => setFilterType(type)}
                    size="sm"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Recipient</th>
                  <th className="text-left py-2 px-3">Subject</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No emails found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{log.recipientEmail}</td>
                      <td className="py-2 px-3 truncate">{log.subject}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {log.emailType}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            log.status === "sent"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500">
                        {new Date(log.sentAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              Showing {filteredLogs.length} of {analytics.emailLogs.length} emails
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
