import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

import { PERSONAS } from "./personas.js";

const PORT = process.env.PORT || 8001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

if (!GROQ_API_KEY) {
  console.error("FATAL: GROQ_API_KEY missing in environment");
  process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGINS?.split(",") || "*" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/", (_req, res) => {
  res.json({ service: "persona-chatbot", status: "ok" });
});

app.get("/api/personas", (_req, res) => {
  res.json(
    Object.entries(PERSONAS).map(([id, p]) => ({ id, name: p.name }))
  );
});

app.post("/api/chat", async (req, res) => {
  const { persona, message, history } = req.body || {};

  if (!persona || !PERSONAS[persona]) {
    return res.status(400).json({ detail: `Unknown persona '${persona}'` });
  }
  if (!message || typeof message !== "string" || message.length > 4000) {
    return res.status(400).json({ detail: "Invalid message" });
  }

  const messages = [{ role: "system", content: PERSONAS[persona].prompt }];
  if (Array.isArray(history)) {
    for (const turn of history.slice(-8)) {
      if (
        turn &&
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string"
      ) {
        messages.push({ role: turn.role, content: turn.content });
      }
    }
  }
  messages.push({ role: "user", content: message });

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 400,
    });
    const reply = completion.choices?.[0]?.message?.content?.trim() || "";
    return res.json({ reply, persona });
  } catch (err) {
    console.error("Groq error:", err?.status, err?.message);
    if (err?.status === 401) {
      return res.status(401).json({ detail: "Invalid Groq API key" });
    }
    if (err?.status === 429) {
      return res
        .status(429)
        .json({ detail: "Rate limit reached. Try again in a few seconds." });
    }
    return res
      .status(502)
      .json({ detail: "LLM provider error. Please retry." });
  }
});

app.listen(PORT, () => {
  console.log(`Persona Chatbot API listening on :${PORT}`);
});
