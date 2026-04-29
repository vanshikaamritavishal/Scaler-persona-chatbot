import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { RotateCcw } from "lucide-react";

import { PERSONAS } from "./lib/personas";
import PersonaSidebar from "./components/PersonaSidebar";
import { MessageBubble, TypingIndicator } from "./components/Message";
import SuggestionChips from "./components/SuggestionChips";
import ChatInput from "./components/ChatInput";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function EmptyState({ persona }) {
  return (
    <div
      data-testid="empty-state-welcome"
      className="relative flex-1 flex items-center justify-center px-6"
    >
      <div className="absolute inset-0 swiss-grid opacity-[0.35] pointer-events-none" />
      <div className="relative max-w-xl text-center">
        <div className="mx-auto w-16 h-16 bg-zinc-950 text-white flex items-center justify-center font-display font-bold text-xl mb-6">
          {persona.initials}
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-zinc-950">
          Talking to {persona.name}
        </h1>
        <p className="mt-3 text-zinc-600 text-base leading-relaxed">
          {persona.blurb}
        </p>
        <div className="mt-8 text-left">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-3 font-medium">
            Try asking
          </div>
          {/* Suggestions are rendered below the input on small screens too,
              but here we surface them prominently in the empty state. */}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activePersonaId, setActivePersonaId] = useState(PERSONAS[0].id);
  const [messages, setMessages] = useState([]); // {role, content}
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const persona = PERSONAS.find((p) => p.id === activePersonaId) || PERSONAS[0];

  const switchPersona = (id) => {
    if (id === activePersonaId) return;
    setActivePersonaId(id);
    setMessages([]); // reset chat on persona switch
  };

  const sendMessage = async (text) => {
    if (!text.trim() || sending) return;
    const userMsg = { role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setSending(true);

    try {
      const { data } = await axios.post(`${API}/chat`, {
        persona: activePersonaId,
        message: text,
        history: messages, // history before this turn
      });
      setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        "Something went wrong reaching the model. Please try again.";
      toast.error(detail);
      // Remove the user message if request truly failed? Keep it — feels better UX.
    } finally {
      setSending(false);
    }
  };

  const resetChat = () => setMessages([]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  return (
    <div className="App h-screen flex flex-col md:flex-row bg-white">
      <Toaster richColors position="top-center" />

      <PersonaSidebar
        personas={PERSONAS}
        activeId={activePersonaId}
        onChange={switchPersona}
      />

      {/* Main column */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <header className="border-b border-zinc-200 px-5 md:px-8 py-4 flex items-center justify-between bg-white">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
              Persona
            </div>
            <div
              className="font-display font-bold text-lg md:text-xl tracking-tight truncate"
              data-testid="active-persona-name"
            >
              {persona.name}
            </div>
          </div>
          <button
            data-testid="reset-chat-button"
            onClick={resetChat}
            disabled={messages.length === 0}
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 border border-zinc-200 text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </header>

        {/* Messages / empty state */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-thin"
          data-testid="message-list"
        >
          {messages.length === 0 ? (
            <EmptyState persona={persona} />
          ) : (
            <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-8 flex flex-col gap-6">
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  persona={persona}
                />
              ))}
              {sending && <TypingIndicator persona={persona} />}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-zinc-200 bg-white">
          <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-4 space-y-3">
            {messages.length === 0 && (
              <SuggestionChips persona={persona} onPick={(s) => sendMessage(s)} />
            )}
            <ChatInput
              onSend={sendMessage}
              disabled={sending}
              placeholder={`Message ${persona.name.split(" ")[0]}...`}
            />
            <p className="text-[11px] text-zinc-400 tracking-wide">
              Switching persona resets the chat. Press Enter to send · Shift+Enter for newline.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
