import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Phone, MessageSquare, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

interface ContactWithReplies {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: Date;
  updatedAt: Date;
  replies: any[];
}

export function ContactDashboard() {
  const [searchEmail, setSearchEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedContact, setSelectedContact] = useState<ContactWithReplies | null>(null);

  // Fetch all contacts
  const { data: contacts = [], isLoading } = trpc.contacts.list.useQuery();
  const updateContactStatus = trpc.contacts.updateStatus.useMutation();

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts as ContactWithReplies[];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Filter by date
    const now = new Date();
    if (filterDate === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(c => new Date(c.createdAt) >= today);
    } else if (filterDate === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(c => new Date(c.createdAt) >= weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(c => new Date(c.createdAt) >= monthAgo);
    }

    // Search by email
    if (searchEmail) {
      filtered = filtered.filter(c =>
        c.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
        c.name.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    return filtered;
  }, [contacts, filterStatus, filterDate, searchEmail]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter(c => c.status === 'new').length,
      read: contacts.filter(c => c.status === 'read').length,
      replied: contacts.filter(c => c.status === 'replied').length,
    };
  }, [contacts]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'read':
        return <Badge className="bg-yellow-500">Read</Badge>;
      case 'replied':
        return <Badge className="bg-green-500">Replied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = async (contactId: number, newStatus: 'new' | 'read' | 'replied') => {
    try {
      await updateContactStatus.mutateAsync({ id: contactId, status: newStatus });
      // Update local state
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update contact status:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.read}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Replied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Search by Email/Name</label>
              <div className="flex gap-2 mt-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1 pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={filterDate} onValueChange={(val: any) => setFilterDate(val)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List and Detail View */}
      <div className="grid grid-cols-3 gap-6">
        {/* Contacts List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Submissions ({filteredContacts.length})</CardTitle>
            <CardDescription>Click to view details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No submissions found</p>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedContact?.id === contact.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{contact.subject}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(contact.status)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(contact.createdAt), 'MMM d, HH:mm')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card className="col-span-2">
          {selectedContact ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedContact.name}</CardTitle>
                    <CardDescription>{selectedContact.email}</CardDescription>
                  </div>
                  {getStatusBadge(selectedContact.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedContact.email}</span>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedContact.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{format(new Date(selectedContact.createdAt), 'PPpp')}</span>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Subject</h4>
                  <p className="text-sm text-gray-700">{selectedContact.subject}</p>
                </div>

                {/* Message */}
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant={selectedContact.status === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact.id, 'new')}
                  >
                    Mark as New
                  </Button>
                  <Button
                    variant={selectedContact.status === 'read' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact.id, 'read')}
                  >
                    Mark as Read
                  </Button>
                  <Button
                    variant={selectedContact.status === 'replied' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact.id, 'replied')}
                  >
                    Mark as Replied
                  </Button>
                </div>

                {/* Replies Section */}
                {selectedContact.replies && selectedContact.replies.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-3">Replies</h4>
                    <div className="space-y-3">
                      {selectedContact.replies.map((reply) => (
                        <div key={reply.id} className="bg-blue-50 p-3 rounded-lg text-sm">
                          <p className="text-gray-600 whitespace-pre-wrap">{reply.reply}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(reply.createdAt), 'PPpp')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96 text-gray-500">
              Select a submission to view details
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
