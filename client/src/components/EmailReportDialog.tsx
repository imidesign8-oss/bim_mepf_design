import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Mail, Loader2 } from "lucide-react";

interface EmailReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportHtml: string;
  reportType: "mep" | "bim";
  projectType: string;
  totalCost: number;
}

export function EmailReportDialog({
  open,
  onOpenChange,
  reportHtml,
  reportType,
  projectType,
  totalCost,
}: EmailReportDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendEmailMutation = trpc.mepCost.sendReportViaEmail.useMutation();

  const handleSend = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");

    try {
      await sendEmailMutation.mutateAsync({
        recipientEmail,
        recipientName: recipientName || undefined,
        customMessage: customMessage || undefined,
        reportHtml,
        reportType,
        projectType,
        totalCost,
      });

      setSuccess(true);
      setTimeout(() => {
        setRecipientEmail("");
        setRecipientName("");
        setCustomMessage("");
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send email");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Report
          </DialogTitle>
          <DialogDescription>
            Send the {reportType.toUpperCase()} cost estimate report via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✓ Email sent successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email *</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={sendEmailMutation.isPending}
            />
          </div>

          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="recipient-name">Recipient Name (Optional)</Label>
            <Input
              id="recipient-name"
              type="text"
              placeholder="John Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={sendEmailMutation.isPending}
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add a personal message to include in the email..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={sendEmailMutation.isPending}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {customMessage.length}/500 characters
            </p>
          </div>

          {/* Report Summary */}
          <div className="p-3 bg-slate-50 rounded-lg text-sm">
            <p className="font-semibold mb-2">Report Details:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Type: {reportType.toUpperCase()}</li>
              <li>• Project: {projectType}</li>
              <li>• Cost: ₹{totalCost.toLocaleString("en-IN")}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sendEmailMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendEmailMutation.isPending || !recipientEmail}
            className="gap-2"
          >
            {sendEmailMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
