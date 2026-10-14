import React from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

function FunctionDisplay({ toolCall }) {
  // Only show a quiet "thinking" indicator while the agent is working.
  // Completed/failed tool steps are hidden from the guest.
  const isActive = ["pending", "running", "in_progress"].includes(toolCall.status || "pending");
  if (!isActive) return null;
  return (
    <div className="mt-1.5 text-xs flex items-center gap-1.5 text-muted-foreground">
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>Thinking…</span>
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border text-card-foreground"
        }`}
      >
        {message.content &&
          (isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none text-sm text-card-foreground [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_strong]:font-semibold">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}
        {message.tool_calls?.map((tc, idx) => (
          <FunctionDisplay key={idx} toolCall={tc} />
        ))}
      </div>
    </div>
  );
}