import { trpc } from "@/lib/trpc";
import { Mail, Reply, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminContacts() {
  const { data: contacts, refetch } = trpc.contacts.list.useQuery();
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: contactDetail } = trpc.contacts.getById.useQuery(
    { id: selectedContact || 0 },
    { enabled: selectedContact !== null }
  );

  const replyMutation = trpc.contacts.reply.useMutation({
    onSuccess: () => {
      toast.success("Reply sent successfully");
      setReplyText("");
      refetch();
    },
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    replyMutation.mutate({ contactId: selectedContact, reply: replyText });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Contact Management</h2>
        <p className="text-muted-foreground">Manage and respond to contact submissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts List */}
        <div className="lg:col-span-1">
          <div className="card-elegant">
            <h3 className="text-xl font-bold mb-4">Submissions</h3>
            {contacts && contacts.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedContact === contact.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{contact.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{contact.subject}</p>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${
                        contact.status === "new" ? "bg-red-100 text-red-800" :
                        contact.status === "read" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {contact.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No contacts</p>
            )}
          </div>
        </div>

        {/* Contact Detail & Reply */}
        <div className="lg:col-span-2">
          {selectedContact && contactDetail ? (
            <div className="space-y-4">
              {/* Contact Details */}
              <div className="card-elegant">
                <h3 className="text-xl font-bold mb-4">{contactDetail.name}</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{contactDetail.email}</p>
                  </div>
                  {contactDetail.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold">{contactDetail.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-semibold">{contactDetail.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{new Date(contactDetail.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <p className="whitespace-pre-wrap">{contactDetail.message}</p>
                </div>
              </div>

              {/* Previous Replies */}
              {contactDetail.replies && contactDetail.replies.length > 0 && (
                <div className="card-elegant">
                  <h4 className="font-bold mb-4">Previous Replies</h4>
                  <div className="space-y-4">
                    {contactDetail.replies.map((reply, i) => (
                      <div key={i} className="border-l-4 border-primary pl-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                        <p className="whitespace-pre-wrap">{reply.reply}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleReply} className="card-elegant">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Reply size={20} />
                  Send Reply
                </h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
                  placeholder="Type your reply here..."
                />
                <button
                  type="submit"
                  disabled={replyMutation.isPending}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {replyMutation.isPending ? "Sending..." : "Send Reply"}
                </button>
              </form>
            </div>
          ) : (
            <div className="card-elegant text-center py-12">
              <Mail size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a contact to view details and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
