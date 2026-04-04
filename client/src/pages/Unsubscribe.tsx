import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function Unsubscribe() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const unsubscribeMutation = trpc.subscriptions.unsubscribe.useMutation({
    onSuccess: () => {
      setStatus("success");
    },
    onError: () => {
      setStatus("error");
    },
  });

  useEffect(() => {
    // Get token from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setStatus("error");
      return;
    }

    setToken(tokenParam);
    // Auto-unsubscribe
    unsubscribeMutation.mutate({ token: tokenParam });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Email Subscription</CardTitle>
          <CardDescription>Manage your newsletter preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader className="animate-spin text-primary" size={32} />
              <p className="text-center text-muted-foreground">Processing your request...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="text-green-600" size={48} />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Successfully Unsubscribed</h3>
                <p className="text-muted-foreground text-sm">
                  You have been removed from our mailing list. You won't receive any more emails from us.
                </p>
              </div>
              <Button onClick={() => navigate("/")} className="w-full mt-4">
                Return to Home
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="text-destructive" size={48} />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Invalid Request</h3>
                <p className="text-muted-foreground text-sm">
                  The unsubscribe link appears to be invalid or has expired. Please try again or contact us for assistance.
                </p>
              </div>
              <Button onClick={() => navigate("/")} className="w-full mt-4">
                Return to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
