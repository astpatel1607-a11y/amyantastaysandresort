import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import MessageBubble from "@/components/agent/MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Plus, MessageSquare, Loader2 } from "lucide-react";

const AGENT_NAME = "booking_concierge";

export default function BookingConcierge() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        if (!active) return;
        if (list && list.length) {
          setConversations(list);
          setActiveId(list[0].id);
        } else {
          const conv = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "New Stay Enquiry", description: "Booking concierge" }
          });
          if (!active) return;
          setConversations([conv]);
          setActiveId(conv.id);
        }
      } catch (e) {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!activeId) {
      setConversation(null);
      setMessages([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const conv = await base44.agents.getConversation(activeId);
        if (!active) return;
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch (e) {
        /* ignore */
      }
    })();
    const unsubscribe = base44.agents.subscribeToConversation(activeId, (data) => {
      setMessages(data.messages || []);
    });
    return () => {
      unsubscribe();
    };
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startNew = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "New Stay Enquiry", description: "Booking concierge" }
      });
      setConversations((prev) => [conv, ...(prev || [])]);
      setActiveId(conv.id);
    } catch (e) {
      /* ignore */
    }
  };

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
    <div className="h-[calc(100dvh-5rem)] flex bg-background">
      <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card/40">
        <div className="p-4">
          <Button onClick={startNew} className="w-full">
            <Plus className="w-4 h-4" /> New Enquiry
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                c.id === activeId ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">{c.metadata?.name || "Enquiry"}</span>
            </button>
          ))}
          {!conversations.length && !loading && (
            <p className="text-xs text-muted-foreground px-3 py-4">No conversations yet.</p>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="px-4 sm:px-6 py-3 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-base sm:text-lg leading-tight">Booking Concierge</h1>
            <p className="text-xs text-muted-foreground truncate">Your guide to planning an Amyanta stay</p>
          </div>
          <Button onClick={startNew} variant="outline" size="sm" className="ml-auto lg:hidden">
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl mb-2">Plan your wilderness escape</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Tell me where you'd like to wander, your dates, and how many guests — I'll help you find the right Amyanta stay and finalize your enquiry.
              </p>
            </div>
          ) : (
            messages.map((m, i) => <MessageBubble key={i} message={m} />)
          )}
        </div>

        <div className="border-t border-border p-3 sm:p-4 bg-card/40">
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
              className="flex-1"
            />
            <Button
              onClick={send}
              disabled={!input.trim() || sending || !conversation}
              size="icon"
              className="h-9 w-9"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}