import React from "react";

export default function SuggestionChips({ persona, onPick }) {
  if (!persona) return null;
  return (
    <div
      className="flex flex-wrap gap-2"
      data-testid="suggestion-chips"
    >
      {persona.suggestions.map((s, i) => (
        <button
          key={i}
          data-testid="suggestion-chip"
          onClick={() => onPick(s)}
          className="text-left text-sm font-medium tracking-tight px-3 py-2 border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 hover:bg-zinc-50 transition-colors rounded-sm"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
