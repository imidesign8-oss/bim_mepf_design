import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function ClientPortalLogin() {
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken.trim()) {
      toast.error("Please enter your access token");
      return;
    }

    setIsLoading(true);

    try {
      // Store token in session storage (not localStorage for security)
      sessionStorage.setItem("clientPortalToken", accessToken);

      // Navigate to portal dashboard
      setLocation("/portal/dashboard");

      toast.success("Welcome to your project portal!");
    } catch (error) {
      toast.error("Failed to access portal. Please check your token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-red-600">Client Portal</CardTitle>
          <CardDescription>Access your project status and deliverables</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token">Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                disabled={isLoading}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">
                You received this token via email from IMI Design. It provides secure access to your project.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Accessing Portal..." : "Access Portal"}
            </Button>

            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Don't have a token?</strong>
              </p>
              <p className="text-xs text-gray-500">
                Contact IMI Design at <a href="mailto:info@imidesign.in" className="text-red-600 hover:underline">info@imidesign.in</a> to request access to your project portal.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
