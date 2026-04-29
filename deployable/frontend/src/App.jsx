import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowUp, RotateCcw } from "lucide-react";

import { PERSONAS } from "./personas";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8001").replace(/\/$/, "");

function PersonaSidebar({ personas, activeId, onChange }) {
  return (
    <aside className="border-r border-zinc-200 bg-white md:w-80 md:shrink-0 md:flex md:flex-col">
      <div className="px-6 pt-8 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-950 flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">P</span>
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none tracking-tight">Persona Chat</div>
            <div className="text-xs text-zinc-500 mt-1 tracking-wide">3 voices · 1 chat</div>
          </div>
        </div>
      </div>

      <nav className="hidden md:block flex-1 overflow-y-auto py-4">
        {personas.map((p) => {
          const active = p.id === activeId;
          return (
            <button
              key={p.id}
              data-testid={`persona-tab-${p.id}`}
              onClick={() => onChange(p.id)}
              className={`w-full text-left px-6 py-4 border-l-4 transition-colors ${
                active ? "border-zinc-950 bg-zinc-50" : "border-transparent hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                  active ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
                }`}>{p.initials}</div>
                <div className="min-w-0">
                  <div className="font-display font-semibold text-[15px] tracking-tight">{p.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{p.role}</div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <nav className="md:hidden flex overflow-x-auto border-b border-zinc-200 scroll-thin">
        {personas.map((p) => {
          const active = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className={`flex items-center gap-2 px-5 py-4 whitespace-nowrap border-b-2 transition-colors ${
                active ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-500"
              }`}
            >
              <span className={`w-7 h-7 flex items-center justify-center font-display font-bold text-xs ${
                active ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
              }`}>{p.initials}</span>
              <span className="font-display font-semibold text-sm tracking-tight">{p.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

      <div className="hidden md:block px-6 py-4 border-t border-zinc-200 text-xs text-zinc-500 leading-relaxed">
        Powered by Groq · Llama 3.3 70B.<br />Switching persona resets the chat.
      </div>
    </aside>
  );
}

function MessageBubble({ role, content, persona }) {
  const isUser = role === "user";
  return (
    <div className={`msg-enter flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 shrink-0 bg-zinc-100 flex items-center justify-center font-display font-bold text-xs text-zinc-950">
          {persona.initials}
        </div>
      )}
      <div className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-sm whitespace-pre-wrap leading-relaxed text-[15px] ${
        isUser ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950"
      }`}>{content}</div>
      {isUser && (
        <div className="w-8 h-8 shrink-0 bg-zinc-950 text-white flex items-center justify-center font-display font-bold text-xs">You</div>
      )}
    </div>
  );
}

function TypingIndicator({ persona }) {
  return (
    <div className="flex gap-3 items-start msg-enter">
      <div className="w-8 h-8 shrink-0 bg-zinc-100 flex items-center justify-center font-display font-bold text-xs text-zinc-950">
        {persona.initials}
      </div>
      <div className="bg-zinc-100 px-4 py-3 rounded-sm flex items-center gap-1.5">
        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
      </div>
    </div>
  );
}

function SuggestionChips({ persona, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {persona.suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onPick(s)}
          className="text-left text-sm font-medium tracking-tight px-3 py-2 border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 hover:bg-zinc-50 transition-colors rounded-sm"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function ChatInput({ onSend, disabled, placeholder }) {
  const [text, setText] = useState("");
  const handle = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };
  return (
    <div className="border border-zinc-300 bg-white focus-within:ring-2 focus-within:ring-zinc-950 transition-shadow rounded-sm">
      <div className="flex items-end gap-2 p-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handle(); } }}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-transparent border-none outline-none px-2 py-2 text-[15px] leading-relaxed placeholder:text-zinc-400 max-h-40"
          style={{ minHeight: "40px" }}
        />
        <button
          onClick={handle}
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

function EmptyState({ persona }) {
  return (
    <div className="relative flex-1 flex items-center justify-center px-6">
      <div className="absolute inset-0 swiss-grid opacity-[0.35] pointer-events-none" />
      <div className="relative max-w-xl text-center">
        <div className="mx-auto w-16 h-16 bg-zinc-950 text-white flex items-center justify-center font-display font-bold text-xl mb-6">
          {persona.initials}
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-zinc-950">
          Talking to {persona.name}
        </h1>
        <p className="mt-3 text-zinc-600 text-base leading-relaxed">{persona.blurb}</p>
        <div className="mt-8 text-left">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-3 font-medium">Try asking</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState(PERSONAS[0].id);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const persona = PERSONAS.find((p) => p.id === activeId);

  const switchPersona = (id) => {
    if (id === activeId) return;
    setActiveId(id);
    setMessages([]);
    setError(null);
  };

  const send = async (text) => {
    if (!text.trim() || sending) return;
    setError(null);
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/api/chat`, {
        persona: activeId,
        message: text,
        history: messages,
      });
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't reach the model. Try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white">
      <PersonaSidebar personas={PERSONAS} activeId={activeId} onChange={switchPersona} />

      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="border-b border-zinc-200 px-5 md:px-8 py-4 flex items-center justify-between bg-white">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 font-medium">Persona</div>
            <div className="font-display font-bold text-lg md:text-xl tracking-tight truncate">{persona.name}</div>
          </div>
          <button
            onClick={() => { setMessages([]); setError(null); }}
            disabled={messages.length === 0}
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 border border-zinc-200 text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin">
          {messages.length === 0 ? (
            <EmptyState persona={persona} />
          ) : (
            <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-8 flex flex-col gap-6">
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} persona={persona} />
              ))}
              {sending && <TypingIndicator persona={persona} />}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200 bg-white">
          <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-4 space-y-3">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
                {error}
              </div>
            )}
            {messages.length === 0 && (
              <SuggestionChips persona={persona} onPick={send} />
            )}
            <ChatInput onSend={send} disabled={sending} placeholder={`Message ${persona.name.split(" ")[0]}...`} />
            <p className="text-[11px] text-zinc-400 tracking-wide">
              Switching persona resets the chat. Press Enter to send · Shift+Enter for newline.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
