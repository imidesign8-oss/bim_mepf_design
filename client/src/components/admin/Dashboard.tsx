import { trpc } from "@/lib/trpc";
import { BarChart3, Users, FileText, Mail } from "lucide-react";

export default function AdminDashboard() {
  const { data: contacts } = trpc.contacts.list.useQuery();
  const { data: blogs } = trpc.blog.listAll.useQuery();
  const { data: projects } = trpc.projects.listAll.useQuery();

  const stats = [
    { label: "Total Contacts", value: contacts?.length || 0, icon: Mail, color: "bg-blue-500" },
    { label: "Blog Posts", value: blogs?.length || 0, icon: FileText, color: "bg-green-500" },
    { label: "Projects", value: projects?.length || 0, icon: BarChart3, color: "bg-purple-500" },
    { label: "Team Members", value: 12, icon: Users, color: "bg-orange-500" },
  ];

  const newContacts = contacts?.filter(c => c.status === "new").slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Contacts */}
      <div className="card-elegant">
        <h3 className="text-xl font-bold mb-4">Recent Contact Submissions</h3>
        {newContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Subject</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {newContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="py-3 px-4">{contact.name}</td>
                    <td className="py-3 px-4">{contact.email}</td>
                    <td className="py-3 px-4">{contact.subject}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No new contacts</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-elegant">
          <h4 className="font-bold mb-2">Create New Blog Post</h4>
          <p className="text-sm text-muted-foreground mb-4">Write and publish new content</p>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            New Post
          </button>
        </div>
        <div className="card-elegant">
          <h4 className="font-bold mb-2">Add New Project</h4>
          <p className="text-sm text-muted-foreground mb-4">Showcase your latest project</p>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            New Project
          </button>
        </div>
        <div className="card-elegant">
          <h4 className="font-bold mb-2">View All Contacts</h4>
          <p className="text-sm text-muted-foreground mb-4">Manage contact submissions</p>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            View Contacts
          </button>
        </div>
      </div>
    </div>
  );
}
