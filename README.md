# Persona-Based AI Chatbot

A clean, minimal AI chatbot that lets you talk to **3 distinct personas** modelled on real Indian tech educators:

- **Anshuman Singh** — Co-founder of Scaler/InterviewBit, ex-Facebook engineer. Blunt, fundamentals-first.
- **Abhimanyu Saxena** — Co-founder of Scaler/InterviewBit, product & strategy. Frameworks, trade-offs.
- **Kshitij Mishra** — Indian tech educator. Calm, first-principles, analogy-driven teaching.

Built with **React (Vite)** + **Node.js (Express)** + **Groq API** (free, fast LLM inference using `llama-3.3-70b-versatile`).

> **Live demo:** _(add your Vercel URL after deployment)_

---

## Features

- 3-persona chat with **distinct voices** (engineered system prompts with few-shot examples + chain-of-thought)
- **Persona switcher** sidebar (desktop) / horizontal tabs (mobile)
- **Reset chat** automatically when persona is switched
- **Typing indicator** while the model is thinking
- **Suggestion chips** seeded per-persona on the empty state
- **Mobile responsive** Swiss high-contrast design
- **Free LLM** via Groq — no paid APIs, no credit card needed
- All secrets via `.env` — nothing hard-coded

---

## Tech stack

| Layer    | Tech                                   |
| -------- | -------------------------------------- |
| Frontend | React 18, Vite, TailwindCSS, axios     |
| Backend  | Node.js 18+, Express, groq-sdk         |
| LLM      | Groq Cloud — `llama-3.3-70b-versatile` |
| Hosting  | Vercel (frontend) · Render (backend)   |

---

## Project structure

```
.
├── deployable/
│   ├── backend/                  # Node + Express API (deploy to Render/Railway)
│   │   ├── src/
│   │   │   ├── index.js          # Express server, /api/chat route
│   │   │   └── personas.js       # The 3 system prompts
│   │   ├── package.json
│   │   └── .env.example
│   └── frontend/                 # React + Vite client (deploy to Vercel)
│       ├── src/
│       │   ├── App.jsx           # Chat UI, persona switcher, typing indicator
│       │   ├── personas.js       # Persona metadata + suggestion chips
│       │   ├── index.css
│       │   └── main.jsx
│       ├── index.html
│       ├── package.json
│       └── .env.example
├── prompts.md                    # All 3 system prompts + design comments
├── reflection.md                 # 300–500 word reflection
└── README.md
```

There is also an Emergent-platform live preview built with FastAPI + React (CRA) under `/app/backend` and `/app/frontend`. The deployable submission code lives under `/app/deployable/`.

---

## Run locally

### 1. Get a free Groq API key

1. Visit https://console.groq.com/keys
2. Sign in (no card required) and click **Create API Key**
3. Copy the key — it starts with `gsk_...`

### 2. Backend

```bash
cd deployable/backend
cp .env.example .env
# edit .env and paste your GROQ_API_KEY
yarn install     # or: npm install
yarn dev         # or: npm run dev
```

Backend runs on `http://localhost:8001` and exposes:

- `GET  /api/`         → health check
- `GET  /api/personas` → list personas
- `POST /api/chat`     → `{ persona, message, history }` → `{ reply, persona }`

### 3. Frontend

```bash
cd deployable/frontend
cp .env.example .env
# .env contains: VITE_API_URL=http://localhost:8001
yarn install
yarn dev
```

Open http://localhost:5173

---

## Environment variables

### Backend (`deployable/backend/.env`)

| Var            | Required | Default                      | Notes                          |
| -------------- | -------- | ---------------------------- | ------------------------------ |
| `GROQ_API_KEY` | yes      | —                            | From console.groq.com/keys     |
| `GROQ_MODEL`   | no       | `llama-3.3-70b-versatile`    | Any free Groq chat model       |
| `PORT`         | no       | `8001`                       |                                |
| `CORS_ORIGINS` | no       | `*`                          | Comma-separated allowed origins |

### Frontend (`deployable/frontend/.env`)

| Var            | Required | Example                         |
| -------------- | -------- | ------------------------------- |
| `VITE_API_URL` | yes      | `https://your-backend.onrender.com` |

---

## Deployment

### Backend → Render (free tier)

1. Push the repo to GitHub.
2. Go to https://dashboard.render.com/ → **New** → **Web Service**.
3. Connect your repo.
4. **Root directory:** `deployable/backend`
5. **Build command:** `yarn install` (or `npm install`)
6. **Start command:** `yarn start` (or `npm start`)
7. Add environment variables: `GROQ_API_KEY`, `GROQ_MODEL`, `CORS_ORIGINS=*` (or your Vercel URL).
8. Deploy. Note the public URL — e.g. `https://persona-chat-api.onrender.com`.

> Render free tier sleeps after inactivity — the first request after sleep takes ~30s.

### Frontend → Vercel

1. Go to https://vercel.com/ → **Add New… → Project** → Import the repo.
2. **Root directory:** `deployable/frontend`
3. **Framework preset:** Vite (auto-detected)
4. **Environment variables:** add `VITE_API_URL` = your Render backend URL.
5. Deploy. Vercel will build and give you a `*.vercel.app` URL.

### Connect frontend → backend

After both are deployed:

1. In **Vercel**, set `VITE_API_URL` to the Render URL and redeploy.
2. In **Render**, set `CORS_ORIGINS` to your Vercel URL (comma-separated for multiple).
3. Open your Vercel URL — you should see the chat working live.

---

## API contract

```http
POST /api/chat
Content-Type: application/json

{
  "persona": "anshuman" | "abhimanyu" | "kshitij",
  "message": "How do I crack MAANG?",
  "history": [
    { "role": "user",      "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

```json
// 200 OK
{ "reply": "Honestly, most people fail because...", "persona": "anshuman" }
```

Errors return `{ "detail": "..." }` with codes `400` (bad input), `401` (bad key), `429` (rate limited), `502` (provider error).

---

