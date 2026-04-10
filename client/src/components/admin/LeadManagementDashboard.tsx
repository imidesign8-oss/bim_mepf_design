import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Users, Target, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function LeadManagementDashboard() {
  const [filterQualification, setFilterQualification] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [assignedToUserId, setAssignedToUserId] = useState<number | null>(null);

  // Fetch lead statistics
  const { data: stats, isLoading: statsLoading } = trpc.leadScoring.getStatistics.useQuery();
  
  // Fetch all leads
  const { data: allLeads, isLoading: leadsLoading, refetch: refetchLeads } = trpc.leadScoring.getAllLeads.useQuery();
  
  // Assign lead mutation
  const assignLeadMutation = trpc.leadScoring.assignLead.useMutation({
    onSuccess: () => {
      toast.success("Lead assigned successfully!");
      setSelectedLeadId(null);
      setAssignedToUserId(null);
      refetchLeads();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to assign lead");
    },
  });

  // Filter leads
  const filteredLeads = allLeads?.filter((lead: any) => {
    const matchesQualification = filterQualification === "all" || lead.qualification === filterQualification;
    const matchesSearch = !searchTerm || 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesQualification && matchesSearch;
  }) || [];

  const getQualificationColor = (qualification: string) => {
    switch (qualification) {
      case "qualified":
        return "bg-green-100 text-green-800";
      case "hot":
        return "bg-orange-100 text-orange-800";
      case "warm":
        return "bg-yellow-100 text-yellow-800";
      case "cold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQualificationIcon = (qualification: string) => {
    switch (qualification) {
      case "qualified":
        return <CheckCircle size={16} />;
      case "hot":
        return <TrendingUp size={16} />;
      case "warm":
        return <Clock size={16} />;
      case "cold":
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const handleAssignLead = () => {
    if (!selectedLeadId || !assignedToUserId) {
      toast.error("Please select a lead and assign to user");
      return;
    }
    assignLeadMutation.mutate({
      contactId: selectedLeadId,
      assignedToUserId: assignedToUserId,
      routingReason: "Assigned from Lead Management Dashboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Qualified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.qualified || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800">Hot Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.hot || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800">Warm Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.warm || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-800">Cold Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats?.cold || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Qualification Funnel</CardTitle>
          <CardDescription>Distribution of leads across qualification levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats && [
              { label: "Qualified", value: stats.qualified, color: "bg-green-500", total: stats.total },
              { label: "Hot", value: stats.hot, color: "bg-orange-500", total: stats.total },
              { label: "Warm", value: stats.warm, color: "bg-yellow-500", total: stats.total },
              { label: "Cold", value: stats.cold, color: "bg-gray-500", total: stats.total },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.value} ({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Management</CardTitle>
          <CardDescription>View and manage all leads with their qualification status</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterQualification} onValueChange={setFilterQualification}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by qualification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {leadsLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No leads found</div>
            ) : (
              filteredLeads.map((lead: any) => (
                <div key={lead.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{lead.name}</h4>
                        <Badge className={`${getQualificationColor(lead.qualification)} flex items-center gap-1`}>
                          {getQualificationIcon(lead.qualification)}
                          {lead.qualification?.charAt(0).toUpperCase() + lead.qualification?.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Email: {lead.email}</div>
                        {lead.phone && <div>Phone: {lead.phone}</div>}
                        {lead.projectType && <div>Project: {lead.projectType} - {lead.projectSize}</div>}
                        {lead.score && <div>Score: {lead.score}/100</div>}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Assignment Panel */}
          {selectedLeadId && (
            <div className="mt-6 p-4 border rounded-lg bg-secondary/30">
              <h4 className="font-semibold mb-4">Assign Lead to Team Member</h4>
              <div className="space-y-3">
                <Select value={assignedToUserId?.toString() || ""} onValueChange={(val) => setAssignedToUserId(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sales Team 1</SelectItem>
                    <SelectItem value="2">Sales Team 2</SelectItem>
                    <SelectItem value="3">Sales Team 3</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAssignLead}
                    disabled={assignLeadMutation.isPending}
                    className="flex-1"
                  >
                    {assignLeadMutation.isPending ? "Assigning..." : "Confirm Assignment"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLeadId(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
