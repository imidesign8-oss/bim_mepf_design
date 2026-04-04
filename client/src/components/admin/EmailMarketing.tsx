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
import { Mail, Upload, Send, Settings, Loader, CheckCircle, AlertCircle } from 'lucide-react';

export function EmailMarketing() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const { data: campaigns = [] } = trpc.emailMarketing.campaigns.list.useQuery();
  const { data: recipients = [] } = trpc.emailMarketing.recipients.list.useQuery({
    recipientType: 'all',
  });
  const { data: templates = [] } = trpc.emailMarketing.templates.list.useQuery();

  // Mutations
  const uploadRecipients = trpc.emailMarketing.recipients.upload.useMutation();
  const createCampaign = trpc.emailMarketing.campaigns.create.useMutation();
  const sendCampaign = trpc.emailMarketing.campaigns.send.useMutation();

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
      } catch (error: any) {
        setUploadStatus(`Error: ${error.message}`);
      }
    };
    reader.readAsText(csvFile);
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

      // Reset form
      setCampaignForm({
        name: '',
        subject: '',
        content: '',
        templateType: 'architect',
      });
      setSelectedRecipients([]);
      alert('Campaign created successfully!');
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
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
                    <p className="text-sm text-gray-500">No recipients available. Upload CSV first.</p>
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
                  <p className="text-center text-gray-500 py-8">No recipients yet. Upload CSV first.</p>
                ) : (
                  recipients.map((recipient: any) => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{recipient.email}</p>
                        <p className="text-xs text-gray-600">
                          {recipient.name} • {recipient.company}
                        </p>
                      </div>
                      <Badge variant="outline">{recipient.recipientType}</Badge>
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
      </Tabs>
    </div>
  );
}
