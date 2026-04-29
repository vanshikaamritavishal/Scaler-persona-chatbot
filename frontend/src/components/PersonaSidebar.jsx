import React from "react";

export default function PersonaSidebar({ personas, activeId, onChange }) {
  return (
    <aside
      className="border-r border-zinc-200 bg-white md:w-80 md:shrink-0 md:flex md:flex-col"
      data-testid="persona-sidebar"
    >
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-950 flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">P</span>
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none tracking-tight">
              Persona Chat
            </div>
            <div className="text-xs text-zinc-500 mt-1 tracking-wide">
              3 voices · 1 chat
            </div>
          </div>
        </div>
      </div>

      {/* Desktop list */}
      <nav className="hidden md:block flex-1 overflow-y-auto py-4">
        {personas.map((p) => {
          const active = p.id === activeId;
          return (
            <button
              key={p.id}
              data-testid={`persona-tab-${p.id}`}
              onClick={() => onChange(p.id)}
              className={[
                "w-full text-left px-6 py-4 border-l-4 transition-colors",
                active
                  ? "border-zinc-950 bg-zinc-50"
                  : "border-transparent hover:bg-zinc-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "w-10 h-10 flex items-center justify-center font-display font-bold text-sm shrink-0",
                    active
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-950",
                  ].join(" ")}
                >
                  {p.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-semibold text-[15px] tracking-tight">
                    {p.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">{p.role}</div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Mobile horizontal tabs */}
      <nav
        className="md:hidden flex overflow-x-auto border-b border-zinc-200 scroll-thin"
        data-testid="persona-tabs-mobile"
      >
        {personas.map((p) => {
          const active = p.id === activeId;
          return (
            <button
              key={p.id}
              data-testid={`persona-tab-mobile-${p.id}`}
              onClick={() => onChange(p.id)}
              className={[
                "flex items-center gap-2 px-5 py-4 whitespace-nowrap border-b-2 transition-colors",
                active
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-500",
              ].join(" ")}
            >
              <span
                className={[
                  "w-7 h-7 flex items-center justify-center font-display font-bold text-xs",
                  active ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-950",
                ].join(" ")}
              >
                {p.initials}
              </span>
              <span className="font-display font-semibold text-sm tracking-tight">
                {p.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer note */}
      <div className="hidden md:block px-6 py-4 border-t border-zinc-200 text-xs text-zinc-500 leading-relaxed">
        Powered by Groq · Llama 3.3 70B.
        <br />
        Switching persona resets the chat.
      </div>
    </aside>
  );
}
