import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [visitorId] = useState(() => `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [visitorInfo, setVisitorInfo] = useState({ email: "", name: "", phone: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [leadScore, setLeadScore] = useState(0);

  // tRPC mutations
  const createConversationMutation = trpc.chat.getOrCreateConversation.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const closeConversationMutation = trpc.chat.closeConversation.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen, conversationId]);

  const initializeConversation = async () => {
    try {
      const conv = await createConversationMutation.mutateAsync({ visitorId });
      setConversationId(conv.id);
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId,
        visitorId,
        message: input,
        visitorEmail: visitorInfo.email || undefined,
        visitorName: visitorInfo.name || undefined,
        visitorPhone: visitorInfo.phone || undefined,
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.message,
      }]);

      setLeadScore(response.leadScore);

      // If routed to admin, show notification
      if (response.routed) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Thank you for your interest! Your inquiry has been routed to our team. Someone will contact you soon to discuss your project needs.",
        }]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (conversationId) {
      try {
        await closeConversationMutation.mutateAsync({ conversationId });
      } catch (error) {
        console.error("Failed to close conversation:", error);
      }
    }
    setIsOpen(false);
    setMessages([]);
    setConversationId(null);
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-40 hover:scale-110"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">IMI Design Assistant</h3>
              <p className="text-sm text-red-100">Ask about our BIM & MEPF services</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-red-800 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Hi! I'm here to help with questions about BIM and MEPF design services.</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-red-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Lead Score Indicator */}
          {leadScore > 0 && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
              <p className="text-xs text-blue-700">
                Lead Score: <span className="font-semibold">{leadScore}/100</span>
              </p>
            </div>
          )}

          {/* Visitor Info Form (shown on first message) */}
          {messages.length === 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 space-y-2">
              <Input
                type="text"
                placeholder="Your name"
                value={visitorInfo.name}
                onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="email"
                placeholder="Your email"
                value={visitorInfo.email}
                onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                className="text-sm"
              />
              <Input
                type="tel"
                placeholder="Your phone (optional)"
                value={visitorInfo.phone}
                onChange={(e) => setVisitorInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="text-sm"
              />
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg flex gap-2">
            <Input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
