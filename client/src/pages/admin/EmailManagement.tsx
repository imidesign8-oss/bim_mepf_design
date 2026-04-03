import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Settings, BarChart3 } from "lucide-react";
import { EmailSettings } from "@/components/admin/EmailSettings";
import { EmailTemplates } from "@/components/admin/EmailTemplates";
import { EmailAnalytics } from "@/components/admin/EmailAnalytics";

type TabType = "settings" | "templates" | "analytics";

export default function EmailManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("settings");

  const tabs = [
    {
      id: "settings" as TabType,
      label: "SMTP Settings",
      icon: Settings,
      description: "Configure your email server",
    },
    {
      id: "templates" as TabType,
      label: "Email Templates",
      icon: Mail,
      description: "Customize email templates",
    },
    {
      id: "analytics" as TabType,
      label: "Analytics",
      icon: BarChart3,
      description: "Track email delivery metrics",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-muted-foreground mt-2">Configure and monitor your email system</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">SMTP Configuration</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Configure your email server settings to enable automatic email notifications
              </p>
            </div>
            <EmailSettings />
          </div>
        )}

        {activeTab === "templates" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Email Templates</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Customize your email templates without touching code
              </p>
            </div>
            <EmailTemplates />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Email Analytics</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor your email delivery performance and track metrics
              </p>
            </div>
            <EmailAnalytics />
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Email System Status</h3>
              <p className="text-sm text-blue-800">
                Your email system is configured to send automatic replies to client inquiries and admin notifications. 
                All emails are sent from <strong>projects@imidesign.in</strong> with a response time of <strong>24 hours</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
