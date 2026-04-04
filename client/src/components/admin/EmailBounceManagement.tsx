"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface BounceRecord {
  id: string;
  email: string;
  bounceType: "permanent" | "temporary" | "complaint";
  reason: string | null;
  bounceCount: number;
  lastBounceAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function EmailBounceManagement() {
  const [bounces, setBounces] = useState<BounceRecord[]>([]);
  const [filteredBounces, setFilteredBounces] = useState<BounceRecord[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [filterType, setFilterType] = useState<"all" | "permanent" | "temporary" | "complaint">("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stats, setStats] = useState({
    totalBounces: 0,
    permanentBounces: 0,
    temporaryBounces: 0,
    complaints: 0,
    suppressedEmails: 0,
  });

  // Load bounces on mount
  useEffect(() => {
    loadBounces();
  }, []);

  // Filter bounces when search or filter changes
  useEffect(() => {
    let filtered = bounces;

    if (filterType !== "all") {
      filtered = filtered.filter((b) => b.bounceType === filterType);
    }

    if (searchEmail) {
      filtered = filtered.filter((b) => b.email.toLowerCase().includes(searchEmail.toLowerCase()));
    }

    setFilteredBounces(filtered);
  }, [bounces, searchEmail, filterType]);

  const loadBounces = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from backend
      const mockBounces: BounceRecord[] = [];
      setBounces(mockBounces);

      // Calculate stats
      setStats({
        totalBounces: mockBounces.length,
        permanentBounces: mockBounces.filter((b) => b.bounceType === "permanent").length,
        temporaryBounces: mockBounces.filter((b) => b.bounceType === "temporary").length,
        complaints: mockBounces.filter((b) => b.bounceType === "complaint").length,
        suppressedEmails: mockBounces.filter((b) => {
          if (b.bounceType === "permanent") return true;
          if (b.bounceType === "temporary" && b.bounceCount >= 3) return true;
          if (b.bounceType === "complaint") return true;
          return false;
        }).length,
      });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load bounces" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBounce = async (email: string) => {
    if (!confirm(`Remove ${email} from bounce list?`)) return;

    try {
      setBounces((prev) => prev.filter((b) => b.email !== email));
      setMessage({ type: "success", text: `${email} removed from bounce list` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove bounce" });
    }
  };

  const handleCleanupOldBounces = async () => {
    if (!confirm("Remove temporary bounces older than 30 days?")) return;

    try {
      const oldBounces = bounces.filter(
        (b) =>
          b.bounceType === "temporary" &&
          new Date(b.lastBounceAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
      );

      setBounces((prev) =>
        prev.filter(
          (b) =>
            !(
              b.bounceType === "temporary" &&
              new Date(b.lastBounceAt).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
            )
        )
      );

      setMessage({
        type: "success",
        text: `Removed ${oldBounces.length} old temporary bounces`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to cleanup bounces" });
    }
  };

  const getBounceTypeColor = (type: string) => {
    switch (type) {
      case "permanent":
        return "bg-red-50 text-red-700 border-red-200";
      case "temporary":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "complaint":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getBounceTypeIcon = (type: string) => {
    switch (type) {
      case "permanent":
        return <AlertCircle className="w-4 h-4" />;
      case "temporary":
        return <AlertTriangle className="w-4 h-4" />;
      case "complaint":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.totalBounces}</p>
              <p className="text-xs text-gray-500 mt-1">Total Bounces</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.permanentBounces}</p>
              <p className="text-xs text-gray-500 mt-1">Permanent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.temporaryBounces}</p>
              <p className="text-xs text-gray-500 mt-1">Temporary</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.complaints}</p>
              <p className="text-xs text-gray-500 mt-1">Complaints</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-700">{stats.suppressedEmails}</p>
              <p className="text-xs text-gray-500 mt-1">Suppressed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Bounce Management</CardTitle>
          <CardDescription>Manage bounced and suppressed email addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          {/* Search and Filter */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search-email">Search Email</Label>
              <Input
                id="search-email"
                placeholder="Search by email address..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="filter-type">Filter by Type</Label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="permanent">Permanent Bounces</option>
                <option value="temporary">Temporary Bounces</option>
                <option value="complaint">Complaints</option>
              </select>
            </div>
          </div>

          {/* Bounces List */}
          <div className="border rounded-lg overflow-hidden">
            {filteredBounces.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {bounces.length === 0 ? "No bounced emails recorded yet" : "No matching bounces found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Count</th>
                      <th className="px-4 py-3 text-left font-semibold">Last Bounce</th>
                      <th className="px-4 py-3 text-left font-semibold">Reason</th>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBounces.map((bounce) => (
                      <tr key={bounce.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{bounce.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getBounceTypeColor(bounce.bounceType)}`}>
                            {getBounceTypeIcon(bounce.bounceType)}
                            {bounce.bounceType}
                          </span>
                        </td>
                        <td className="px-4 py-3">{bounce.bounceCount}</td>
                        <td className="px-4 py-3 text-xs">
                          {new Date(bounce.lastBounceAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {bounce.reason || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveBounce(bounce.email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={loadBounces} disabled={loading} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={handleCleanupOldBounces}
              disabled={loading}
              variant="outline"
              className="text-orange-600 hover:text-orange-700"
            >
              Clean Up Old Bounces
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
