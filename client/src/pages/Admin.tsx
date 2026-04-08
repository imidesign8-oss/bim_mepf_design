import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import AdminDashboard from "@/components/admin/Dashboard";
import AdminBlog from "@/components/admin/Blog";
import AdminServices from "@/components/admin/Services";
import { CaseStudiesAdmin } from "@/components/admin/CaseStudies";
import AdminProjects from "@/components/admin/Projects";
import AdminContacts from "@/components/admin/Contacts";
import AdminSettings from "@/components/admin/Settings";
import AdminSEO from "@/components/admin/SEO";
import { SchemaValidator } from "@/components/admin/SchemaValidator";
import EmailManagement from "@/pages/admin/EmailManagement";
import HomePageCMS from "@/components/admin/HomePageCMS";
import AboutPageCMS from "@/components/admin/AboutPageCMS";
import ServicesPageCMS from "@/components/admin/ServicesPageCMS";
import ProjectsPageCMS from "@/components/admin/ProjectsPageCMS";
import { ContactDashboard } from "@/components/admin/ContactDashboard";
import { EmailMarketingEnhanced } from "@/components/admin/EmailMarketingEnhanced";
import { CampaignPerformanceDashboard } from "@/components/admin/CampaignPerformanceDashboard";
import { UnsubscribeManagement } from "@/components/admin/UnsubscribeManagement";
import { SubscriptionsAdmin } from "@/components/admin/Subscriptions";
import { MepAdmin } from "./MepAdmin";
import PricingManagement from "@/components/admin/PricingManagement";

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pricing", label: "Pricing Management", icon: "💵" },
    { id: "mep-admin", label: "MEP Cost Management", icon: "💰" },
    { id: "blog", label: "Blog", icon: "📝" },
    { id: "services", label: "Services", icon: "🔧" },
    { id: "case-studies", label: "Case Studies", icon: "📸" },
    { id: "projects", label: "Projects", icon: "🏗️" },
    { id: "contacts", label: "Contact Submissions", icon: "📋" },
    { id: "contact-dashboard", label: "Contact Dashboard", icon: "📊" },
    { id: "email", label: "Email Management", icon: "✉️" },
    { id: "email-marketing", label: "Email Marketing", icon: "📢" },
    { id: "campaign-analytics", label: "Campaign Analytics", icon: "📈" },
    { id: "unsubscribe", label: "Unsubscribe Management", icon: "🚫" },
    { id: "subscriptions", label: "Subscriptions", icon: "📧" },
    { id: "cms-home", label: "CMS: Home", icon: "🏠" },
    { id: "cms-about", label: "CMS: About", icon: "📄" },
    { id: "cms-services", label: "CMS: Services", icon: "📚" },
    { id: "cms-projects", label: "CMS: Projects", icon: "🖼️" },
    { id: "seo", label: "SEO", icon: "🔍" },
    { id: "schema-validator", label: "Schema Validator", icon: "✓" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-card border-r border-border p-6 min-h-[calc(100vh-80px)]">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                    currentTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentTab === "dashboard" && <AdminDashboard onNavigate={setCurrentTab} />}
          {currentTab === "pricing" && <PricingManagement />}
          {currentTab === "mep-admin" && <MepAdmin />}
          {currentTab === "blog" && <AdminBlog />}
          {currentTab === "services" && <AdminServices />}
          {currentTab === "case-studies" && <CaseStudiesAdmin />}
          {currentTab === "projects" && <AdminProjects />}
          {currentTab === "contacts" && <AdminContacts />}
          {currentTab === "contact-dashboard" && <ContactDashboard />}
          {currentTab === "email" && <EmailManagement />}
          {currentTab === "email-marketing" && <EmailMarketingEnhanced />}
          {currentTab === "campaign-analytics" && <CampaignPerformanceDashboard />}
          {currentTab === "unsubscribe" && <UnsubscribeManagement />}
          {currentTab === "subscriptions" && <SubscriptionsAdmin />}
          {currentTab === "cms-home" && <HomePageCMS />}
          {currentTab === "cms-about" && <AboutPageCMS />}
          {currentTab === "cms-services" && <ServicesPageCMS />}
          {currentTab === "cms-projects" && <ProjectsPageCMS />}
          {currentTab === "seo" && <AdminSEO />}
          {currentTab === "schema-validator" && <SchemaValidator />}
          {currentTab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}
