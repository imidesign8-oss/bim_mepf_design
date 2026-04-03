import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Mail, Eye } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  responseTime: string;
  phone: string;
  servicesUrl: string;
  faqUrl: string;
  companyName: string;
  previewHtml: string;
}

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: "client-auto-reply",
      name: "Client Auto-Reply",
      subject: "We've Received Your Inquiry",
      responseTime: "24 hours",
      phone: "+91 9405707777",
      servicesUrl: "https://imidesign.in/services",
      faqUrl: "https://imidesign.in/#faq",
      companyName: "IMI DESIGN TEAM",
      previewHtml: "",
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>("client-auto-reply");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const currentTemplate = templates.find((t) => t.id === selectedTemplate);

  const handleChange = (field: keyof EmailTemplate, value: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplate ? { ...t, [field]: value } : t))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem("emailTemplates", JSON.stringify(templates));
      setMessage({ type: "success", text: "Email template saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save template" });
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    if (!currentTemplate) return "";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ED1C24; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #ED1C24; margin-bottom: 10px; }
          .links { margin: 15px 0; }
          .links a { color: #ED1C24; text-decoration: none; margin-right: 20px; }
          .contact-info { background-color: #fff; padding: 15px; border-left: 4px solid #ED1C24; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${currentTemplate.companyName}</h1>
            <p>${currentTemplate.subject}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Dear [Client Name],</p>
              <p>Thank you for reaching out to us! We have received your inquiry and appreciate your interest in our BIM & MEPF Design Services.</p>
            </div>

            <div class="section">
              <h3>Expected Response Time</h3>
              <p>Our team typically responds to all inquiries within <strong>${currentTemplate.responseTime}</strong>. We appreciate your patience!</p>
            </div>

            <div class="section">
              <h3>In the Meantime</h3>
              <p>Feel free to explore our services and learn more about our expertise:</p>
              <div class="links">
                <a href="${currentTemplate.servicesUrl}">View Our Services</a>
                <a href="${currentTemplate.faqUrl}">FAQ</a>
              </div>
            </div>

            <div class="contact-info">
              <h3 style="margin-top: 0; color: #ED1C24;">Quick Contact</h3>
              <p><strong>Phone:</strong> <a href="tel:${currentTemplate.phone.replace(/\s/g, "")}" style="color: #ED1C24; text-decoration: none;">${currentTemplate.phone}</a></p>
            </div>

            <div class="footer">
              <p>This is an automated response. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${currentTemplate.companyName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  if (!currentTemplate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Template Customization
          </CardTitle>
          <CardDescription>Customize your email templates without touching code</CardDescription>
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

          <div>
            <Label>Template</Label>
            <div className="flex gap-2 mt-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={currentTemplate.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="We've Received Your Inquiry"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={currentTemplate.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="IMI DESIGN TEAM"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responseTime">Expected Response Time</Label>
              <Input
                id="responseTime"
                value={currentTemplate.responseTime}
                onChange={(e) => handleChange("responseTime", e.target.value)}
                placeholder="24 hours"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={currentTemplate.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 9405707777"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="servicesUrl">Services URL</Label>
              <Input
                id="servicesUrl"
                value={currentTemplate.servicesUrl}
                onChange={(e) => handleChange("servicesUrl", e.target.value)}
                placeholder="https://imidesign.in/services"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="faqUrl">FAQ URL</Label>
              <Input
                id="faqUrl"
                value={currentTemplate.faqUrl}
                onChange={(e) => handleChange("faqUrl", e.target.value)}
                placeholder="https://imidesign.in/#faq"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Template"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>This is how your email will look to recipients</CardDescription>
          </CardHeader>
          <CardContent>
            <iframe
              srcDoc={generatePreview()}
              className="w-full h-96 border rounded-lg"
              title="Email Preview"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
