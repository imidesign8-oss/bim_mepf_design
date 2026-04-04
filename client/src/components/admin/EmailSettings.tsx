"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function EmailSettings() {
  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: 465,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    replyTo: "",
    enableSSL: true,
    enableTLS: false,
    notifyOnContactSubmission: true,
    notifyOnHighScoreLead: true,
    notificationEmails: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // tRPC mutations and queries
  const configureSettings = trpc.email.configureSettings.useMutation();
  const testConnection = trpc.email.testConnection.useMutation();
  const getSettings = trpc.email.getSettings.useQuery();

  // Load settings on mount
  useEffect(() => {
    if (getSettings.data) {
      setFormData({
        smtpHost: getSettings.data.smtpHost || "",
        smtpPort: getSettings.data.smtpPort || 465,
        smtpUser: getSettings.data.smtpUser || "",
        smtpPassword: getSettings.data.smtpPassword || "",
        fromEmail: getSettings.data.fromEmail || "",
        fromName: getSettings.data.fromName || "",
        replyTo: getSettings.data.replyTo || "",
        enableSSL: getSettings.data.enableSSL || true,
        enableTLS: getSettings.data.enableTLS || false,
        notifyOnContactSubmission: getSettings.data.notifyOnContactSubmission || true,
        notifyOnHighScoreLead: getSettings.data.notifyOnHighScoreLead || true,
        notificationEmails: getSettings.data.notificationEmails || "",
      });
    }
  }, [getSettings.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await configureSettings.mutateAsync({
        ...formData,
        notificationEmails: formData.notificationEmails || JSON.stringify([formData.fromEmail]),
      });
      setMessage({ type: "success", text: "Email settings saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to save settings" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      const result = await testConnection.mutateAsync();
      if (result.success) {
        setMessage({ type: "success", text: "SMTP connection test successful!" });
      } else {
        setMessage({ type: "error", text: result.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "SMTP connection failed. Please check your settings." 
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>Configure your email server settings for sending notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                name="smtpHost"
                placeholder="smtpout.secureserver.net"
                value={formData.smtpHost}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                name="smtpPort"
                type="number"
                value={formData.smtpPort}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpUser">SMTP User (Email)</Label>
              <Input
                id="smtpUser"
                name="smtpUser"
                type="email"
                placeholder="projects@imidesign.in"
                value={formData.smtpUser}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                name="smtpPassword"
                type="password"
                placeholder="Your SMTP password"
                value={formData.smtpPassword}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromEmail">From Email Address</Label>
              <Input
                id="fromEmail"
                name="fromEmail"
                type="email"
                placeholder="projects@imidesign.in"
                value={formData.fromEmail}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                name="fromName"
                placeholder="IMI DESIGN"
                value={formData.fromName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="replyTo">Reply-To Email Address</Label>
            <Input
              id="replyTo"
              name="replyTo"
              type="email"
              placeholder="projects@imidesign.in"
              value={formData.replyTo}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableSSL"
                name="enableSSL"
                checked={formData.enableSSL}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, enableSSL: checked as boolean }))
                }
              />
              <Label htmlFor="enableSSL" className="cursor-pointer">
                Enable SSL
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableTLS"
                name="enableTLS"
                checked={formData.enableTLS}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, enableTLS: checked as boolean }))
                }
              />
              <Label htmlFor="enableTLS" className="cursor-pointer">
                Enable TLS
              </Label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyOnContactSubmission"
                  name="notifyOnContactSubmission"
                  checked={formData.notifyOnContactSubmission}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, notifyOnContactSubmission: checked as boolean }))
                  }
                />
                <Label htmlFor="notifyOnContactSubmission" className="cursor-pointer">
                  Notify on contact form submission
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyOnHighScoreLead"
                  name="notifyOnHighScoreLead"
                  checked={formData.notifyOnHighScoreLead}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, notifyOnHighScoreLead: checked as boolean }))
                  }
                />
                <Label htmlFor="notifyOnHighScoreLead" className="cursor-pointer">
                  Notify on high-score leads (80+)
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notificationEmails">Notification Email Addresses (comma-separated)</Label>
            <Input
              id="notificationEmails"
              name="notificationEmails"
              placeholder="projects@imidesign.in, admin@imidesign.in"
              value={formData.notificationEmails}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading || configureSettings.isPending}
              className="flex-1"
            >
              {loading || configureSettings.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
            <Button
              onClick={handleTestConnection}
              disabled={testLoading || testConnection.isPending}
              variant="outline"
            >
              {testLoading || testConnection.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
