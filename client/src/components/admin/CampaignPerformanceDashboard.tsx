import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Mail, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const COLORS = ['#ED1C24', '#FF6B6B', '#FFA07A'];

export function CampaignPerformanceDashboard() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  // Queries
  const { data: allMetrics, isLoading: metricsLoading } = trpc.campaignAnalytics.getAllCampaignMetrics.useQuery();
  const { data: summary, isLoading: summaryLoading } = trpc.campaignAnalytics.getEngagementStatisticsSummary.useQuery();
  const { data: timeline, isLoading: timelineLoading } = trpc.campaignAnalytics.getCampaignEngagementTimeline.useQuery(
    { campaignId: selectedCampaignId || 0 },
    { enabled: !!selectedCampaignId }
  );
  const { data: recipientEngagement, isLoading: recipientLoading } = trpc.campaignAnalytics.getCampaignRecipientEngagement.useQuery(
    { campaignId: selectedCampaignId || 0 },
    { enabled: !!selectedCampaignId }
  );

  const selectedCampaign = allMetrics?.find(m => m.campaignId === selectedCampaignId);

  if (metricsLoading || summaryLoading) {
    return <div className="text-center py-8">Loading campaign analytics...</div>;
  }

  if (!allMetrics || !summary) {
    return <Alert><AlertDescription>Failed to load campaign analytics</AlertDescription></Alert>;
  }

  // Prepare data for charts
  const campaignComparisonData = allMetrics.map(m => ({
    name: m.campaignName.substring(0, 15),
    openRate: m.openRate,
    clickRate: m.clickRate,
  }));

  const statusDistribution = [
    { name: 'Sent', value: summary.totalSent, color: '#ED1C24' },
    { name: 'Opened', value: summary.totalOpens, color: '#FF6B6B' },
    { name: 'Clicked', value: summary.totalClicks, color: '#FFA07A' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCampaigns}</div>
            <p className="text-xs text-gray-500 mt-1">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSent.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Emails delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Avg Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">{summary.totalOpens.toLocaleString()} opens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Avg Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgClickRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">{summary.totalClicks.toLocaleString()} clicks</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Campaign Comparison</TabsTrigger>
          <TabsTrigger value="details">Campaign Details</TabsTrigger>
          <TabsTrigger value="recipients">Recipient Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Distribution</CardTitle>
              <CardDescription>Overall email engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>Average performance across all campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Open Rate</p>
                  <p className="text-2xl font-bold text-red-600">{summary.avgOpenRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Click Rate</p>
                  <p className="text-2xl font-bold text-red-600">{summary.avgClickRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Conversion Rate</p>
                  <p className="text-2xl font-bold text-red-600">{summary.avgConversionRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold text-red-600">{summary.totalRecipients.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Comparison</CardTitle>
              <CardDescription>Open rates and click rates across all campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={campaignComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="openRate" fill="#ED1C24" name="Open Rate %" />
                  <Bar dataKey="clickRate" fill="#FF6B6B" name="Click Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Campaign</CardTitle>
              <CardDescription>Choose a campaign to view detailed analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allMetrics.map(metric => (
                  <div
                    key={metric.campaignId}
                    onClick={() => setSelectedCampaignId(metric.campaignId)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCampaignId === metric.campaignId
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <h3 className="font-semibold text-sm">{metric.campaignName}</h3>
                    <p className="text-xs text-gray-600 mt-1">Status: {metric.campaignStatus}</p>
                    <p className="text-xs text-gray-600">Recipients: {metric.totalRecipients}</p>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span>Open: {metric.openRate.toFixed(1)}%</span>
                      <span>Click: {metric.clickRate.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedCampaign && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCampaign.campaignName}</CardTitle>
                  <CardDescription>Detailed performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Recipients</p>
                      <p className="text-2xl font-bold">{selectedCampaign.totalRecipients}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Sent</p>
                      <p className="text-2xl font-bold text-green-600">{selectedCampaign.sentCount}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{selectedCampaign.failedCount}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Opened</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedCampaign.openCount}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Clicked</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedCampaign.clickCount}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Bounce Rate</p>
                      <p className="text-2xl font-bold">{selectedCampaign.bounceRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Open Rate</p>
                      <p className="text-3xl font-bold text-red-600">{selectedCampaign.openRate.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Click Rate</p>
                      <p className="text-3xl font-bold text-red-600">{selectedCampaign.clickRate.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-3xl font-bold text-red-600">{selectedCampaign.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {timelineLoading ? (
                <div className="text-center py-8">Loading engagement timeline...</div>
              ) : timeline && timeline.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Timeline</CardTitle>
                    <CardDescription>Opens and clicks over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="opens"
                          stroke="#ED1C24"
                          name="Opens"
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="clicks"
                          stroke="#FF6B6B"
                          name="Clicks"
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients">
          {selectedCampaignId ? (
            recipientLoading ? (
              <div className="text-center py-8">Loading recipient data...</div>
            ) : recipientEngagement ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recipient Engagement</CardTitle>
                  <CardDescription>Individual recipient engagement for {selectedCampaign?.campaignName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Email</th>
                          <th className="text-left py-2 px-2">Status</th>
                          <th className="text-left py-2 px-2">Opened</th>
                          <th className="text-left py-2 px-2">Clicked</th>
                          <th className="text-left py-2 px-2">Time to Open</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipientEngagement.map((recipient: any) => (
                          <tr key={recipient.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 text-xs">{recipient.email}</td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                recipient.status === 'sent'
                                  ? 'bg-green-100 text-green-800'
                                  : recipient.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {recipient.status}
                              </span>
                            </td>
                            <td className="py-2 px-2">
                              {recipient.opened ? (
                                <span className="text-green-600 font-semibold">✓ Yes</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {recipient.clicked ? (
                                <span className="text-green-600 font-semibold">✓ Yes</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              {recipient.timeToOpen ? `${recipient.timeToOpen} min` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : null
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Select a campaign from the Campaign Details tab to view recipient engagement</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
