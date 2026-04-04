/**
 * Unsubscribe Management Component
 * Manage unsubscribed recipients and subscription preferences
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Mail, Trash2, RotateCcw } from 'lucide-react';

export function UnsubscribeManagement() {
  const [activeTab, setActiveTab] = useState<'stats' | 'list' | 'manage'>('stats');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(null);

  // Queries
  const statsQuery = trpc.unsubscribe.getStats.useQuery();
  const unsubscribedListQuery = trpc.unsubscribe.getUnsubscribedList.useQuery();

  // Mutations
  const unsubscribeByEmailMutation = trpc.unsubscribe.unsubscribeByEmail.useMutation({
    onSuccess: () => {
      setSearchEmail('');
      statsQuery.refetch();
      unsubscribedListQuery.refetch();
    },
  });

  const resubscribeMutation = trpc.unsubscribe.resubscribe.useMutation({
    onSuccess: () => {
      setSelectedRecipient(null);
      statsQuery.refetch();
      unsubscribedListQuery.refetch();
    },
  });

  const handleUnsubscribeByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    await unsubscribeByEmailMutation.mutateAsync({ email: searchEmail });
  };

  const handleResubscribe = async (recipientId: number) => {
    await resubscribeMutation.mutateAsync({ recipientId });
  };

  const stats = statsQuery.data;
  const unsubscribedList = unsubscribedListQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Unsubscribe Management</h2>
        <p className="text-gray-600 mt-1">Manage email subscription preferences and unsubscribed recipients</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'list'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Unsubscribed List
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'manage'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage
        </button>
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRecipients}</div>
              <p className="text-xs text-gray-500 mt-1">All email recipients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.activeRecipients}</div>
              <p className="text-xs text-gray-500 mt-1">Subscribed to emails</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Unsubscribed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.unsubscribedCount}</div>
              <p className="text-xs text-gray-500 mt-1">Opted out of emails</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Unsubscribe Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.unsubscribeRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">Of total recipients</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unsubscribed List Tab */}
      {activeTab === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Unsubscribed Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            {unsubscribedList.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-3" />
                <p className="text-gray-600">No unsubscribed recipients</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unsubscribedList.map((recipient: any) => (
                  <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{recipient.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{recipient.email}</p>
                      {recipient.company && (
                        <p className="text-xs text-gray-500">{recipient.company}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{recipient.recipientType}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResubscribe(recipient.id)}
                        disabled={resubscribeMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Resubscribe
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unsubscribe by Email */}
            <div>
              <h3 className="font-medium mb-3">Unsubscribe by Email</h3>
              <form onSubmit={handleUnsubscribeByEmail} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={unsubscribeByEmailMutation.isPending || !searchEmail.trim()}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Unsubscribe
                </Button>
              </form>
              {unsubscribeByEmailMutation.isPending && (
                <p className="text-sm text-gray-600 mt-2">Processing...</p>
              )}
              {unsubscribeByEmailMutation.isSuccess && (
                <p className="text-sm text-green-600 mt-2">✓ Successfully unsubscribed</p>
              )}
              {unsubscribeByEmailMutation.isError && (
                <p className="text-sm text-red-600 mt-2">✗ Failed to unsubscribe</p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Unsubscribe Link in Emails</p>
                <p>All marketing emails automatically include an unsubscribe link. Recipients can click it to manage their preferences.</p>
              </div>
            </div>

            {/* Subscription Best Practices */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-gray-900">Best Practices</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Always include an unsubscribe link in every email</li>
                <li>• Respect unsubscribe requests immediately</li>
                <li>• Monitor unsubscribe rates to improve email content</li>
                <li>• Segment your audience to send relevant content</li>
                <li>• Comply with email marketing regulations (CAN-SPAM, GDPR)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
