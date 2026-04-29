import React from "react";

export function MessageBubble({ role, content, persona }) {
  const isUser = role === "user";
  return (
    <div
      data-testid={isUser ? "message-user" : "message-ai"}
      className={[
        "msg-enter flex gap-3",
        isUser ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      {!isUser && persona && (
        <div className="w-8 h-8 shrink-0 bg-zinc-100 flex items-center justify-center font-display font-bold text-xs text-zinc-950">
          {persona.initials}
        </div>
      )}
      <div
        className={[
          "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-sm whitespace-pre-wrap leading-relaxed text-[15px]",
          isUser
            ? "bg-zinc-950 text-white"
            : "bg-zinc-100 text-zinc-950",
        ].join(" ")}
      >
        {content}
      </div>
      {isUser && (
        <div className="w-8 h-8 shrink-0 bg-zinc-950 text-white flex items-center justify-center font-display font-bold text-xs">
          You
        </div>
      )}
    </div>
  );
}

export function TypingIndicator({ persona }) {
  return (
    <div
      data-testid="typing-indicator"
      className="flex gap-3 items-start msg-enter"
    >
      <div className="w-8 h-8 shrink-0 bg-zinc-100 flex items-center justify-center font-display font-bold text-xs text-zinc-950">
        {persona?.initials || "AI"}
      </div>
      <div className="bg-zinc-100 px-4 py-3 rounded-sm flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
