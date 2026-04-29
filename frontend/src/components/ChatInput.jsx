import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="border border-zinc-300 bg-white focus-within:ring-2 focus-within:ring-zinc-950 transition-shadow rounded-sm">
      <div className="flex items-end gap-2 p-2">
        <textarea
          data-testid="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder || "Ask anything..."}
          rows={1}
          className="flex-1 resize-none bg-transparent border-none outline-none px-2 py-2 text-[15px] leading-relaxed placeholder:text-zinc-400 max-h-40"
          style={{ minHeight: "40px" }}
        />
        <button
          data-testid="send-button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="w-10 h-10 bg-zinc-950 text-white flex items-center justify-center disabled:bg-zinc-300 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors rounded-sm shrink-0"
          aria-label="Send"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
