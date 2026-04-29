# PRD — Persona-Based AI Chatbot

## Original Problem Statement
Build a Persona-Based AI Chatbot with 3 personas (Anshuman Singh, Abhimanyu Saxena, Kshitij Mishra). Free LLM API, clean chat UI with persona switching, reset on switch, typing indicator, suggestion chips per persona, mobile responsive, deployable. Tech stack: React (Vite) + Node/Express. Deploy to Vercel + Render.

## User Choices (locked)
- Build on Emergent's React (CRA) + FastAPI stack for live preview
- Also produce a deployable React Vite + Node/Express version under `/app/deployable`
- LLM: Groq free tier with `llama-3.3-70b-versatile`
- API key provided by user (in `backend/.env`)
- Personas confirmed: Scaler co-founders (Anshuman, Abhimanyu) + tech educator Kshitij Mishra

## Architecture
- **Live preview** — `/app/backend` (FastAPI + Groq SDK) + `/app/frontend` (React CRA + Tailwind + sonner)
- **Deployable submission** — `/app/deployable/backend` (Express + groq-sdk) + `/app/deployable/frontend` (Vite + React + Tailwind)
- Both share the same 3 system prompts (kept identical between Python and JS files)
- Chat is stateless on backend; frontend sends `history` array per request, backend trims to last 8 turns

## Core Requirements (static)
- 3 personas with distinct voices (engineered prompts: identity, style, beliefs, CoT, 3+ few-shot, output format, constraints)
- Persona switcher — desktop sidebar + mobile horizontal tabs
- Chat resets on persona switch
- Typing indicator (3 blinking square dots — Swiss aesthetic)
- Suggestion chips seeded per persona on the empty state
- Mobile responsive
- API keys via .env, never hardcoded
- Deployment-ready (Vercel + Render)

## Implemented (2026-02)
- ✅ FastAPI backend with `/api/chat`, `/api/personas`, `/api/` endpoints
- ✅ 3 high-quality system prompts in `personas.py` (≈1.2k tokens each, 3 few-shot examples each)
- ✅ React frontend with Swiss high-contrast design (Cabinet Grotesk + IBM Plex Sans, sharp corners, electric blue accent)
- ✅ Persona sidebar (desktop) + horizontal tabs (mobile) with `data-testid` per persona
- ✅ Empty state with persona blurb + suggestion chips + Swiss grid backdrop
- ✅ Message bubbles (user black, AI zinc-100), typing indicator, msg-enter animation
- ✅ Reset button + reset-on-persona-switch
- ✅ ChatInput with Enter-to-send, Shift+Enter for newline
- ✅ sonner toasts on API errors
- ✅ Deployable Node/Express + Vite mirror under `/app/deployable`
- ✅ README.md, prompts.md (with design comments), reflection.md (300–500 words), .env.example
- ✅ Backend pytest suite (9 tests, 100% pass)
- ✅ Frontend Playwright e2e (22 assertions, 100% pass)

## What's not implemented (future)
- P1: Token streaming (currently waits for full reply)
- P1: Persistent chat history per persona via localStorage
- P2: Frontend RTL unit tests around switchPersona reset
- P2: AsyncGroq client to avoid blocking the FastAPI event loop under load
- P2: Retry button on failed messages
- P2: Voice mode (TTS) for Kshitij persona
- P2: Eval harness — fixed prompt set diffed across persona versions to detect drift

## Backlog (priority)
- P0: none (MVP complete)
- P1: streaming, localStorage persistence
- P2: async Groq client, retry button, evaluator harness, Kshitij voice

## Next tasks
- User to push code to GitHub
- Deploy backend to Render (root: `deployable/backend`)
- Deploy frontend to Vercel (root: `deployable/frontend`, env var `VITE_API_URL`)
- Set CORS_ORIGINS on Render to the Vercel URL once known
