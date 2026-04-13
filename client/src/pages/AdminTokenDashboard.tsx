import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe"];

export default function AdminTokenDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(90);

  // Queries
  const dashboardQuery = trpc.adminTokens.getDashboardAnalytics.useQuery();
  const tokensQuery = trpc.adminTokens.listTokens.useQuery(
    { projectId: selectedProjectId || 0, includeInactive: false },
    { enabled: !!selectedProjectId }
  );

  // Mutations
  const generateTokenMutation = trpc.adminTokens.generateToken.useMutation({
    onSuccess: (data) => {
      toast.success("Token generated successfully!");
      setTokenName("");
      setExpiresInDays(90);
      tokensQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate token: ${error.message}`);
    },
  });

  const revokeTokenMutation = trpc.adminTokens.revokeToken.useMutation({
    onSuccess: () => {
      toast.success("Token revoked successfully!");
      tokensQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to revoke token: ${error.message}`);
    },
  });

  const handleGenerateToken = () => {
    if (!selectedProjectId || !tokenName) {
      toast.error("Please select a project and enter a token name");
      return;
    }

    generateTokenMutation.mutate({
      projectId: selectedProjectId,
      tokenName,
      expiresInDays,
    });
  };

  const handleRevokeToken = (tokenId: number) => {
    if (confirm("Are you sure you want to revoke this token?")) {
      revokeTokenMutation.mutate({ tokenId });
    }
  };

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Token Management</h1>
        <p className="text-gray-600 mt-2">
          Generate and manage client portal access tokens with analytics
        </p>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalTokens}</div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard.activeTokens} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.activeTokens}</div>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard.inactiveTokens} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.totalUsage}</div>
              <p className="text-xs text-gray-500 mt-1">portal accesses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.expiringTokensCount}</div>
              <p className="text-xs text-gray-500 mt-1">within 7 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Token Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Token</CardTitle>
          <CardDescription>Create a new access token for a client project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Project ID</label>
              <Input
                type="number"
                placeholder="Enter project ID"
                value={selectedProjectId || ""}
                onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : 0)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Token Name</label>
              <Input
                placeholder="e.g., Client Portal Access"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Expires In (days)</label>
              <Input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateToken}
            disabled={generateTokenMutation.isPending}
            className="w-full"
          >
            {generateTokenMutation.isPending ? "Generating..." : "Generate Token"}
          </Button>
        </CardContent>
      </Card>

      {/* Tokens List */}
      {selectedProjectId && (
        <Card>
          <CardHeader>
            <CardTitle>Project Tokens</CardTitle>
            <CardDescription>
              Manage tokens for project {selectedProjectId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokensQuery.isLoading ? (
              <div className="text-center py-8">Loading tokens...</div>
            ) : tokensQuery.data && tokensQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Token Name</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Expires</th>
                      <th className="text-left py-3 px-4 font-medium">Usage</th>
                      <th className="text-left py-3 px-4 font-medium">Last Used</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokensQuery.data.map((token: any) => (
                      <tr key={token.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{token.tokenName}</div>
                          {token.description && (
                            <div className="text-xs text-gray-500">{token.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={token.isActive ? "default" : "secondary"}>
                            {token.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {token.expiresAt ? (
                            <div>
                              <div className="text-sm">
                                {new Date(token.expiresAt).toLocaleDateString()}
                              </div>
                              {token.isExpired && (
                                <Badge variant="destructive" className="mt-1">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Never</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{token.usageCount}</td>
                        <td className="py-3 px-4">
                          {token.lastUsedAt
                            ? new Date(token.lastUsedAt).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeToken(token.id)}
                            disabled={revokeTokenMutation.isPending}
                          >
                            Revoke
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No tokens found for this project
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics Charts */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Active", value: dashboard.activeTokens },
                      { name: "Inactive", value: dashboard.inactiveTokens },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1].map((index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expiring Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.expiringTokens && dashboard.expiringTokens.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.expiringTokens.map((token: any) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded"
                    >
                      <div>
                        <div className="font-medium text-sm">{token.tokenName}</div>
                        <div className="text-xs text-gray-600">
                          Expires: {new Date(token.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">Expiring</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tokens expiring within 7 days
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
