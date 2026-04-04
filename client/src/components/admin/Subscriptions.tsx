import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function SubscriptionsAdmin() {
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: subscriptions = [], isLoading, refetch } = trpc.subscriptions.list.useQuery({ limit, offset });
  const deleteMutation = trpc.subscriptions.delete.useMutation({
    onSuccess: () => {
      toast.success("Subscription deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete subscription");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCopyEmail = (email: string, id: number) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Subscriptions</CardTitle>
          <CardDescription>Manage newsletter and update subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subscriptions yet</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Unsubscribed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub: any) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {sub.email}
                            <button
                              onClick={() => handleCopyEmail(sub.email, sub.id)}
                              className="p-1 hover:bg-secondary rounded"
                              title="Copy email"
                            >
                              {copiedId === sub.id ? (
                                <Check size={14} className="text-green-600" />
                              ) : (
                                <Copy size={14} className="text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sub.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {sub.isActive ? "Active" : "Unsubscribed"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(sub.subscribedAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sub.unsubscribedAt ? formatDate(sub.unsubscribedAt) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleDelete(sub.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1 hover:bg-destructive/10 rounded text-destructive disabled:opacity-50"
                            title="Delete subscription"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {subscriptions.length} subscriptions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={subscriptions.length < limit}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
