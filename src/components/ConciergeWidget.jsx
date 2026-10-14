import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import MessageBubble from "@/components/agent/MessageBubble";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, X, Loader2 } from "lucide-react";

const AGENT_NAME = "booking_concierge";

// Meta-AI-style floating help button with a slide-in chat panel that talks
// to the Amyanta booking concierge agent. Conversation is lazy-initialised on
// first open so it adds no load to normal browsing.
export default function ConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const startedRef = useRef(false);

  // Start a fresh conversation each time the panel opens.
  useEffect(() => {
    if (!open || startedRef.current) return;
    startedRef.current = true;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: "Stay Enquiry", description: "Booking concierge" }
        });
        if (!active) return;
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch (e) {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [open]);

  // Subscribe to live updates while the panel is open.
  useEffect(() => {
    if (!open || !conversation) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsubscribe;
  }, [open, conversation]);

  // When the panel closes, clear local state so the next open starts a new chat.
  useEffect(() => {
    if (open) return;
    setConversation(null);
    setMessages([]);
    startedRef.current = false;
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !conversation) return;
    setInput("");
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: text });
    } catch (e) {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Chat with Amyanta Concierge"
        className={`fixed z-40 right-4 lg:right-6 bottom-20 lg:bottom-6 flex items-center gap-2 pl-3 pr-4 h-12 rounded-full bg-juniper text-ivory shadow-xl hover:bg-forest transition-all duration-300 group ${
          open ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
        }`}
      >
        <span className="relative flex">
          <span className="absolute inline-flex h-full w-full rounded-full bg-ochre/40 animate-ping opacity-75" />
          <Sparkles className="w-5 h-5 text-ochre relative" />
        </span>
        <span className="text-sm font-medium tracking-wide hidden sm:inline">Ask Concierge</span>
      </button>

      {/* Slide-in chat panel */}
      <div
        className={`fixed z-50 inset-0 lg:inset-auto lg:right-6 lg:bottom-6 lg:top-auto lg:w-[380px] transition-transform duration-300 ${
          open ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-full lg:translate-x-full pointer-events-none"
        }`}
      >
        {/* Mobile backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-charcoal/40 lg:hidden ${open ? "block" : "hidden"}`}
        />
        <div className="relative lg:absolute lg:inset-auto lg:bottom-0 lg:right-0 lg:w-full h-[80dvh] lg:h-[600px] max-h-[80dvh] lg:max-h-[80vh] bg-card shadow-2xl flex flex-col overflow-hidden rounded-t-2xl lg:rounded-2xl border hairline">
          {/* Header */}
          <div className="px-4 py-3 border-b hairline flex items-center gap-3 bg-juniper text-ivory">
            <div className="w-9 h-9 rounded-full bg-ochre/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-ochre" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading text-base leading-tight">Amyanta Concierge</div>
              <div className="text-xs text-ivory/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close concierge"
              className="w-8 h-8 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-ivory/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-background">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="font-display text-2xl text-juniper mb-2">Plan your wilderness escape</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Tell me where you'd like to wander, your dates and how many guests — I'll help you find the right Amyanta stay.
                </p>
              </div>
            ) : (
              messages.map((m, i) => <MessageBubble key={i} message={m} />)
            )}
          </div>

          {/* Composer */}
          <div className="border-t hairline p-3 bg-card/40">
            <div className="flex items-end gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about a stay or share your trip details..."
                className="flex-1 rounded-full"
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending || !conversation}
                className="w-9 h-9 shrink-0 rounded-full bg-juniper text-ivory flex items-center justify-center disabled:opacity-40 hover:bg-forest transition-colors"
                aria-label="Send"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}