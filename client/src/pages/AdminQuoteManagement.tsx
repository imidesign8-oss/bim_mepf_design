import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";
import { Eye, Mail, Download, CheckCircle, XCircle, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  generated: "bg-blue-100 text-blue-800",
  sent: "bg-yellow-100 text-yellow-800",
  viewed: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

const STATUS_ICONS: Record<string, any> = {
  generated: Clock,
  sent: Mail,
  viewed: Eye,
  accepted: CheckCircle,
  rejected: XCircle,
  expired: Clock,
};

export default function AdminQuoteManagement() {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [tokenFormData, setTokenFormData] = useState({
    clientEmail: "",
    projectName: "",
    expiresInDays: 90,
  });

  // Queries
  const quotesQuery = trpc.quoteManagement.listQuotes.useQuery({
    status: selectedStatus as any,
    limit: 100,
  });

  const statsQuery = trpc.quoteManagement.getStatistics.useQuery();

  // Mutations
  const updateStatusMutation = trpc.quoteManagement.updateQuoteStatus.useMutation({
    onSuccess: () => {
      toast.success("Quote status updated");
      quotesQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const approveTokenMutation = trpc.quoteManagement.approveAndGenerateToken.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Token generated successfully!");
        toast.message(`Token: ${data.token}`, {
          description: `Expires: ${data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "N/A"}`,
        });
        setShowTokenForm(false);
        setSelectedQuoteId(null);
        setTokenFormData({ clientEmail: "", projectName: "", expiresInDays: 90 });
        quotesQuery.refetch();
        statsQuery.refetch();
      }
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const rejectMutation = trpc.quoteManagement.rejectQuote.useMutation({
    onSuccess: () => {
      toast.success("Quote rejected");
      quotesQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const handleGenerateToken = () => {
    if (!selectedQuoteId || !tokenFormData.clientEmail || !tokenFormData.projectName) {
      toast.error("Please fill in all fields");
      return;
    }

    approveTokenMutation.mutate({
      quoteId: selectedQuoteId,
      clientEmail: tokenFormData.clientEmail,
      projectName: tokenFormData.projectName,
      expiresInDays: tokenFormData.expiresInDays,
    });
  };

  const handleRejectQuote = (quoteId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      rejectMutation.mutate({ quoteId, reason });
    }
  };

  const stats = statsQuery.data;
  const quotes = quotesQuery.data || [];

  // Prepare chart data
  const chartData = stats
    ? [
        { name: "Generated", value: stats.generated },
        { name: "Sent", value: stats.sent },
        { name: "Viewed", value: stats.viewed },
        { name: "Accepted", value: stats.accepted },
        { name: "Rejected", value: stats.rejected },
      ]
    : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Quote Management</h1>
        <p className="text-gray-600 mt-2">
          Review, approve, and manage client quote requests
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.generated}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Viewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.viewed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalValue.toFixed(0)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStatus === undefined ? "default" : "outline"}
          onClick={() => setSelectedStatus(undefined)}
        >
          All Quotes
        </Button>
        {["generated", "sent", "viewed", "accepted", "rejected"].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            onClick={() => setSelectedStatus(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>
            {quotes.length} quote{quotes.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quotesQuery.isLoading ? (
            <div className="text-center py-8">Loading quotes...</div>
          ) : quotes.length > 0 ? (
            <div className="space-y-4">
              {quotes.map((quote: any) => {
                const StatusIcon = STATUS_ICONS[quote.status] || Clock;
                return (
                  <div
                    key={quote.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{quote.clientName}</h3>
                          <Badge className={STATUS_COLORS[quote.status]}>
                            <StatusIcon size={14} className="mr-1" />
                            {quote.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{quote.clientEmail}</p>
                        {quote.clientCompany && (
                          <p className="text-sm text-gray-600">{quote.clientCompany}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₹{quote.quoteAmount}</div>
                        <p className="text-xs text-gray-500">
                          {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {quote.status === "generated" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedQuoteId(quote.id);
                              setShowTokenForm(true);
                            }}
                          >
                            Approve & Generate Token
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectQuote(quote.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {quote.status === "sent" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              quoteId: quote.id,
                              status: "viewed",
                            })
                          }
                        >
                          Mark as Viewed
                        </Button>
                      )}

                      {quote.proposalPdfUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a href={quote.proposalPdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download size={14} className="mr-1" />
                            PDF
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {quote.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{String(quote.rejectionReason)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No quotes found for this status
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Generation Modal */}
      {showTokenForm && selectedQuoteId && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Generate Access Token</CardTitle>
            <CardDescription>
              Create a portal access token for the client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client Email</label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={tokenFormData.clientEmail}
                onChange={(e) =>
                  setTokenFormData({ ...tokenFormData, clientEmail: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="e.g., Downtown Office Complex"
                value={tokenFormData.projectName}
                onChange={(e) =>
                  setTokenFormData({ ...tokenFormData, projectName: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Token Expires In (days)</label>
              <Input
                type="number"
                value={tokenFormData.expiresInDays}
                onChange={(e) =>
                  setTokenFormData({
                    ...tokenFormData,
                    expiresInDays: parseInt(e.target.value),
                  })
                }
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateToken}
                disabled={approveTokenMutation.isPending}
                className="flex-1"
              >
                {approveTokenMutation.isPending ? "Generating..." : "Generate Token"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTokenForm(false);
                  setSelectedQuoteId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
