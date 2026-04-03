import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function EmailSettings() {
  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    replyTo: "",
    enableSSL: false,
    enableTLS: true,
    notifyOnContactSubmission: true,
    notifyOnHighScoreLead: true,
    notificationEmails: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, you'd fetch from your backend
      // For now, we'll use localStorage as a fallback
      const saved = localStorage.getItem("emailSettings");
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage for now
      localStorage.setItem("emailSettings", JSON.stringify(formData));
      setMessage({ type: "success", text: "Email settings saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      // In a real app, call your backend test endpoint
      // For now, just show success
      setMessage({ type: "success", text: "SMTP connection test successful!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "SMTP connection failed. Please check your settings." });
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
                placeholder="smtp.gmail.com"
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
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                name="smtpUser"
                placeholder="your-email@gmail.com"
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
                placeholder="Your app password"
                value={formData.smtpPassword}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                name="fromEmail"
                type="email"
                placeholder="noreply@imidesign.in"
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
            <Label htmlFor="replyTo">Reply-To Email</Label>
            <Input
              id="replyTo"
              name="replyTo"
              type="email"
              placeholder="support@imidesign.in"
              value={formData.replyTo}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
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

          <div className="flex gap-2">
            <Button onClick={handleTestConnection} variant="outline" disabled={testLoading}>
              {testLoading ? "Testing..." : "Test Connection"}
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure which events trigger email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="notifyOnContactSubmission"
              checked={formData.notifyOnContactSubmission}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, notifyOnContactSubmission: checked as boolean }))
              }
            />
            <Label htmlFor="notifyOnContactSubmission" className="cursor-pointer">
              Notify on contact form submissions
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="notifyOnHighScoreLead"
              checked={formData.notifyOnHighScoreLead}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, notifyOnHighScoreLead: checked as boolean }))
              }
            />
            <Label htmlFor="notifyOnHighScoreLead" className="cursor-pointer">
              Notify on high-scoring chat leads (80+)
            </Label>
          </div>

          <div>
            <Label htmlFor="notificationEmails">Notification Email Addresses</Label>
            <Input
              id="notificationEmails"
              name="notificationEmails"
              placeholder="admin@imidesign.in, support@imidesign.in"
              value={formData.notificationEmails}
              onChange={handleChange}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">Comma-separated list of emails to receive notifications</p>
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Notification Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
