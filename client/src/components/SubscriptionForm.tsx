import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Check } from "lucide-react";

export function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subscribeMutation = trpc.subscriptions.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.info("Email already subscribed");
      } else {
        toast.error(error.message || "Failed to subscribe");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    subscribeMutation.mutate({ email });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribeMutation.isPending || isSubmitted}
            className="pl-10"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={subscribeMutation.isPending || isSubmitted}
          className="gap-2"
        >
          {isSubmitted ? (
            <>
              <Check size={18} />
              Subscribed
            </>
          ) : subscribeMutation.isPending ? (
            "Subscribing..."
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        We'll send you updates about our latest services and projects.
      </p>
    </form>
  );
}
