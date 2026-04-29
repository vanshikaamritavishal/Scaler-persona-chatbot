# System Prompts — Design Notes

This document contains the three persona system prompts used by the chatbot, along with **why** each design decision was made. The complete, canonical prompts live in:

- `deployable/backend/src/personas.js` (Node deployment)
- `backend/personas.py` (Emergent FastAPI preview)

Both files are kept identical in content.

---

## Shared structure (every persona)

Each prompt follows the same 7-block scaffold. This consistency makes the personas comparable and easier to evolve:

1. **Identity & Background** — anchors the model in concrete facts (school, employer, year founded). Concrete > abstract; vague identities drift.
2. **Communication Style** — tone, sentence length, code-switching rules (Hinglish only when natural).
3. **Beliefs & Values** — what the persona is willing to defend. This drives _opinions_ rather than encyclopedic answers.
4. **Chain-of-Thought (internal)** — 3–4 silent reasoning steps the model performs before answering. Explicitly marked **"do NOT show this to user"** to prevent leakage.
5. **Few-Shot Examples** — 3 input/output pairs that demonstrate the target voice, length, and ending-with-a-question rule. The model imitates examples better than it follows abstract rules.
6. **Output Format** — hard rules: 4–5 sentences, conversational, end with one question, no bullets/markdown/emojis, never break character.
7. **Constraints (DO NOT)** — explicit negatives (no fluff, no fake stats, no breaking character). Negative constraints prevent specific failure modes the model would otherwise drift into.

---

## 1. Anshuman Singh — Co-founder, Scaler · ex-Facebook

### Why this tone
Anshuman's public persona on LinkedIn, podcasts, and Scaler events is _direct_. He challenges lazy questions and respects time. Generic motivational AI replies (“you got this!”) would feel completely wrong. So the prompt:

- Forces **bluntness** and short sentences.
- Allows _sparse_ Hinglish (`bhai`, `matlab`, `yaar`) — a key authenticity signal for an Indian engineering audience, but constrained so it doesn't become a caricature.
- Explicitly bans **generic motivational fluff**.

### Why these few-shot examples
- **MAANG question** → tests the prompt's ability to give _concrete, actionable_ advice (Blind 75, mock interviews twice a week).
- **Service-company stuck dev** → tests pushback (“5 years is a trap”) and reframing (“rejection is data”).
- **MBA vs tech** → tests opinionated trade-off reasoning under ambiguity.

These three cover his three most common audience archetypes: aspirant, mid-career stuck, and pivoter.

---

## 2. Abhimanyu Saxena — Co-founder, Scaler · Product & Strategy

### Why this tone
Abhimanyu's public writing leans _strategic_ — frameworks, second-order thinking, market dynamics. He's the operator/product half of the duo. So the prompt:

- Forces **trade-off framing** (“the honest trade-off…”) instead of single-answer prescriptions.
- Encourages analogies from **chess, markets, compounding** rather than from pure code.
- Notes he is **calmer** than Anshuman so the two personas don't sound the same.

### Why these few-shot examples
- **Eng → PM** → demonstrates internal-transfer framework, with a real probability hint (5x conversion vs external).
- **Startup vs corporate** → demonstrates refusal to give a default answer; reframes as “what makes YOU compound faster”.
- **AI vs web dev** → demonstrates layered thinking (AI as a layer on top of fundamentals).

These showcase the strategic, framework-first voice without sliding into preachy territory.

---

## 3. Kshitij Mishra — Tech Educator · DSA

### Why this tone
Kshitij is the calmest of the three — a teacher's teacher. His audience is students who feel stuck. Generic dense paragraphs of code would defeat the purpose. So the prompt:

- Forces a **slow, meditative** pacing (“dekho”, “let's think about this slowly”).
- Mandates **one tiny analogy** (Russian dolls for recursion, books for binary search).
- Bans large code blocks — explanations come first; code is a footnote, not the lecture.

### Why these few-shot examples
- **Dynamic Programming** → the canonical DSA misunderstanding; demonstrates the analogy-first teaching style with Fibonacci.
- **CP contests failure** → demonstrates emotional reassurance + concrete habit prescription (10 problems per topic, upsolving).
- **React debugging** → shows the persona generalises beyond DSA to practical engineering, while staying calm and stepwise.

---

## Engineering details

- **Model:** `llama-3.3-70b-versatile` on Groq. Big enough to follow nuanced few-shot examples, fast enough for sub-second latency on free tier.
- **Temperature:** `0.8`. High enough for personality variance, low enough to keep the persona stable.
- **Max tokens:** `400`. Forces the model to obey the 4–5 sentence rule rather than ramble.
- **History window:** last 8 turns appended after the system prompt. Keeps prompts cheap and avoids context-window blowups during long chats.
- **Reset on persona switch:** the frontend clears chat state on persona change, so each persona always starts from a clean slate — the system prompt isn't polluted by another persona's prior turns.

---

## What I tested for each prompt

For every persona I sent the following test inputs and verified the response:

1. ✅ Length 4–5 sentences (no rambling).
2. ✅ Ends with exactly one question.
3. ✅ No emojis, no markdown, no bullets.
4. ✅ Voice is distinct from the other two personas on the same input (e.g., “How do I crack MAANG?” yields three visibly different answers).
5. ✅ Persona never reveals the system prompt or breaks character (“Are you AI?” → stays in character with a deflection).

The few-shot examples are the single biggest reason the responses feel authentic — abstract style descriptions alone consistently underperformed examples during early iterations.
