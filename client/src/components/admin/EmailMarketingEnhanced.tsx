import React, { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Upload, Send, Settings, Loader, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

export function EmailMarketingEnhanced() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    templateType: 'architect' as 'architect' | 'builder' | 'custom',
  });
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [sendingCampaignId, setSendingCampaignId] = useState<number | null>(null);
  
  // Manual email form state
  const [manualEmailForm, setManualEmailForm] = useState({
    email: '',
    name: '',
    recipientType: 'architect' as 'architect' | 'builder' | 'other',
    company: '',
    city: '',
    state: '',
  });
  
  // Service promotion state
  const [showServicePromotion, setShowServicePromotion] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const { data: campaigns = [], refetch: refetchCampaigns } = trpc.emailMarketing.campaigns.list.useQuery();
  const { data: recipients = [], refetch: refetchRecipients } = trpc.emailMarketing.recipients.list.useQuery({
    recipientType: 'all',
  });
  const { data: templates = [] } = trpc.emailMarketing.templates.list.useQuery();
  const { data: services = [] } = trpc.services.list.useQuery();

  // Mutations
  const uploadRecipients = trpc.emailMarketing.recipients.upload.useMutation();
  const createCampaign = trpc.emailMarketing.campaigns.create.useMutation();
  const sendCampaign = trpc.emailMarketing.campaigns.send.useMutation();
  const addRecipient = trpc.emailMarketing.recipients.add.useMutation({
    onSuccess: () => {
      refetchRecipients();
      setManualEmailForm({
        email: '',
        name: '',
        recipientType: 'architect',
        company: '',
        city: '',
        state: '',
      });
    },
  });
  const deleteRecipient = trpc.emailMarketing.recipients.delete.useMutation({
    onSuccess: () => {
      refetchRecipients();
    },
  });

  const handleCSVUpload = async () => {
    if (!csvFile) {
      setUploadStatus('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvContent = e.target?.result as string;
      try {
        setUploadStatus('Uploading...');
        const result = await uploadRecipients.mutateAsync({ csvContent });
        setUploadStatus(
          `Success! Added ${result.insertedCount} new recipients, ${result.skippedCount} already existed`
        );
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        refetchRecipients();
      } catch (error: any) {
        setUploadStatus(`Error: ${error.message}`);
      }
    };
    reader.readAsText(csvFile);
  };

  const handleAddManualEmail = async () => {
    if (!manualEmailForm.email) {
      alert('Please enter an email address');
      return;
    }

    try {
      await addRecipient.mutateAsync(manualEmailForm);
      alert('Email added successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteRecipient = async (recipientId: number) => {
    if (!window.confirm('Are you sure you want to delete this recipient?')) return;

    try {
      await deleteRecipient.mutateAsync({ id: recipientId });
      alert('Recipient deleted successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateServicePromotionCampaign = async () => {
    if (!selectedService) {
      alert('Please select a service');
      return;
    }

    const service = services.find((s: any) => s.id === parseInt(selectedService));
    if (!service) return;

    const campaignName = `Service Promotion: ${service.title}`;
    const subject = `Discover Our ${service.title} Services - IMI DESIGN`;
    const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ED1C24; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .section h2 { color: #ED1C24; font-size: 20px; margin-top: 0; }
    .section p { margin: 10px 0; }
    .benefits { list-style: none; padding: 0; }
    .benefits li { padding: 8px 0; padding-left: 25px; position: relative; }
    .benefits li:before { content: "✓"; position: absolute; left: 0; color: #ED1C24; font-weight: bold; }
    .cta-button { display: inline-block; background-color: #ED1C24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .cta-button:hover { background-color: #c41620; }
    .footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    .footer a { color: #ED1C24; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>IMI DESIGN</h1>
      <p>${service.title} Expertise</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Discover Our ${service.title} Services</h2>
        <p>${service.description}</p>
      </div>

      <div class="section">
        <h2>What We Offer</h2>
        <ul class="benefits">
          <li>Expert ${service.title} design and planning</li>
          <li>Advanced BIM coordination</li>
          <li>Comprehensive project documentation</li>
          <li>On-time delivery and support</li>
          <li>Compliance with international standards</li>
        </ul>
      </div>

      <div class="section">
        <p style="text-align: center;">
          <a href="https://imidesign.in/services/${service.slug}" class="cta-button">Learn More About ${service.title}</a>
        </p>
      </div>

      <div class="section">
        <h2>Let's Work Together</h2>
        <p>Ready to elevate your projects with our ${service.title} expertise?</p>
        <p><strong>Contact us today:</strong></p>
        <p>
          📧 Email: projects@imidesign.in<br>
          📞 Phone: +91 9405707777<br>
          🌐 Website: https://imidesign.in
        </p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 IMI DESIGN. All rights reserved.</p>
      <p><a href="https://imidesign.in/#unsubscribe">Unsubscribe</a> | <a href="https://imidesign.in">Visit Our Website</a></p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await createCampaign.mutateAsync({
        name: campaignName,
        subject,
        content,
        templateType: 'custom',
        recipientIds: selectedRecipients.length > 0 ? selectedRecipients : recipients.map((r: any) => r.id),
      });

      setShowServicePromotion(false);
      setSelectedService('');
      alert('Service promotion campaign created successfully!');
      refetchCampaigns();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    try {
      await createCampaign.mutateAsync({
        ...campaignForm,
        recipientIds: selectedRecipients,
      });

      setCampaignForm({
        name: '',
        subject: '',
        content: '',
        templateType: 'architect',
      });
      setSelectedRecipients([]);
      alert('Campaign created successfully!');
      refetchCampaigns();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSendCampaign = async (campaignId: number) => {
    if (!window.confirm('Are you sure you want to send this campaign?')) return;

    try {
      setSendingCampaignId(campaignId);
      await sendCampaign.mutateAsync({
        campaignId,
        fromEmail: 'projects@imidesign.in',
        fromName: 'IMI DESIGN',
      });
      alert('Campaign sent successfully!');
      refetchCampaigns();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSendingCampaignId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'sending':
        return <Badge className="bg-yellow-500">Sending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="services">Service Promo</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Create New Campaign
              </CardTitle>
              <CardDescription>
                Design and send email campaigns to architects and builders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  placeholder="e.g., Q1 2026 Architect Outreach"
                  value={campaignForm.name}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Template</label>
                <Select
                  value={campaignForm.templateType}
                  onValueChange={(val: any) =>
                    setCampaignForm({ ...campaignForm, templateType: val })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="architect">Architect Template</SelectItem>
                    <SelectItem value="builder">Builder Template</SelectItem>
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Subject Line</label>
                <Input
                  placeholder="Email subject"
                  value={campaignForm.subject}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, subject: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email Content (HTML)</label>
                <Textarea
                  placeholder="Paste HTML content here..."
                  value={campaignForm.content}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, content: e.target.value })
                  }
                  rows={6}
                  className="mt-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Select Recipients</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {recipients.length === 0 ? (
                    <p className="text-sm text-gray-500">No recipients available. Add emails first.</p>
                  ) : (
                    recipients.map((recipient: any) => (
                      <label key={recipient.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.includes(recipient.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients([...selectedRecipients, recipient.id]);
                            } else {
                              setSelectedRecipients(
                                selectedRecipients.filter(id => id !== recipient.id)
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {recipient.name || recipient.email} ({recipient.recipientType})
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedRecipients.length} recipient(s) selected
                </p>
              </div>

              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaign.isPending}
                className="w-full"
              >
                {createCampaign.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Create Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Campaigns List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Campaigns</CardTitle>
              <CardDescription>{campaigns.length} campaign(s) total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No campaigns yet</p>
                ) : (
                  campaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {campaign.totalRecipients} recipients • {campaign.sentCount} sent
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(campaign.status)}
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={sendingCampaignId === campaign.id}
                          >
                            {sendingCampaignId === campaign.id && (
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="space-y-6">
          {/* Manual Email Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Email Manually
              </CardTitle>
              <CardDescription>
                Add individual email addresses directly to your recipient list
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={manualEmailForm.email}
                    onChange={(e) =>
                      setManualEmailForm({ ...manualEmailForm, email: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="John Doe"
                    value={manualEmailForm.name}
                    onChange={(e) =>
                      setManualEmailForm({ ...manualEmailForm, name: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Recipient Type</label>
                  <Select
                    value={manualEmailForm.recipientType}
                    onValueChange={(val: any) =>
                      setManualEmailForm({ ...manualEmailForm, recipientType: val })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architect">Architect</SelectItem>
                      <SelectItem value="builder">Builder</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    placeholder="ABC Architects"
                    value={manualEmailForm.company}
                    onChange={(e) =>
                      setManualEmailForm({ ...manualEmailForm, company: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    placeholder="Mumbai"
                    value={manualEmailForm.city}
                    onChange={(e) =>
                      setManualEmailForm({ ...manualEmailForm, city: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    placeholder="Maharashtra"
                    value={manualEmailForm.state}
                    onChange={(e) =>
                      setManualEmailForm({ ...manualEmailForm, state: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddManualEmail}
                disabled={addRecipient.isPending}
                className="w-full"
              >
                {addRecipient.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Add Email
              </Button>
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Recipients
              </CardTitle>
              <CardDescription>
                Import email list from CSV file. Format: email, name, recipientType, company, city, state
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">CSV File</label>
                <div className="flex gap-2 mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <Button onClick={handleCSVUpload} disabled={!csvFile || uploadRecipients.isPending}>
                    {uploadRecipients.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    Upload
                  </Button>
                </div>
              </div>

              {uploadStatus && (
                <Alert className={uploadStatus.includes('Error') ? 'bg-red-50' : 'bg-green-50'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadStatus}</AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">CSV Format Example:</p>
                <pre className="text-xs overflow-x-auto">
{`email,name,recipientType,company,city,state
john@example.com,John Doe,architect,ABC Architects,Mumbai,Maharashtra
jane@example.com,Jane Smith,builder,XYZ Builders,Bangalore,Karnataka`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Recipients List */}
          <Card>
            <CardHeader>
              <CardTitle>Recipients List</CardTitle>
              <CardDescription>{recipients.length} recipient(s) total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recipients.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No recipients yet. Add emails to get started.</p>
                ) : (
                  recipients.map((recipient: any) => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{recipient.email}</p>
                        <p className="text-xs text-gray-600">
                          {recipient.name} • {recipient.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline">{recipient.recipientType}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRecipient(recipient.id)}
                          disabled={deleteRecipient.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Pre-designed templates for different recipient types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates.map((template: any) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.preview}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {template.id}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Promotion Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Create Service Promotion Campaign
              </CardTitle>
              <CardDescription>
                Quickly create campaigns promoting your specific services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Service to Promote</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Recipients to Target</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {recipients.length === 0 ? (
                    <p className="text-sm text-gray-500">No recipients available.</p>
                  ) : (
                    recipients.map((recipient: any) => (
                      <label key={recipient.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.includes(recipient.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients([...selectedRecipients, recipient.id]);
                            } else {
                              setSelectedRecipients(
                                selectedRecipients.filter(id => id !== recipient.id)
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {recipient.name || recipient.email} ({recipient.recipientType})
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedRecipients.length > 0 ? `${selectedRecipients.length} recipient(s) selected` : 'Select recipients or leave empty to target all'}
                </p>
              </div>

              <Button
                onClick={handleCreateServicePromotionCampaign}
                disabled={!selectedService || createCampaign.isPending}
                className="w-full"
              >
                {createCampaign.isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Create Service Promotion Campaign
              </Button>
            </CardContent>
          </Card>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Service promotion campaigns are automatically generated with service details, benefits, and a link to the service page. The campaign will be created as a draft and ready to send.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
