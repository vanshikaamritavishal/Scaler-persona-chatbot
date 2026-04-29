from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from groq import Groq
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional

from personas import PERSONAS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Groq client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing in environment")

groq_client = Groq(api_key=GROQ_API_KEY, timeout=30.0)

# App
app = FastAPI(title="Persona Chatbot API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("personachat")


class ChatTurn(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    persona: str = Field(..., description="anshuman | abhimanyu | kshitij")
    message: str = Field(..., min_length=1, max_length=4000)
    history: Optional[List[ChatTurn]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    persona: str


@api_router.get("/")
async def root():
    return {"service": "persona-chatbot", "status": "ok"}


@api_router.get("/personas")
async def list_personas():
    return [
        {"id": pid, "name": p["name"]}
        for pid, p in PERSONAS.items()
    ]


@api_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    persona = PERSONAS.get(req.persona)
    if not persona:
        raise HTTPException(status_code=400, detail=f"Unknown persona '{req.persona}'")

    messages = [{"role": "system", "content": persona["prompt"]}]
    # last 8 turns max to keep prompt short
    for turn in (req.history or [])[-8:]:
        if turn.role in ("user", "assistant") and turn.content:
            messages.append({"role": turn.role, "content": turn.content})
    messages.append({"role": "user", "content": req.message})

    try:
        completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.8,
            max_tokens=400,
        )
        reply = completion.choices[0].message.content.strip()
        logger.info(
            "chat ok persona=%s in=%d out=%d",
            req.persona,
            completion.usage.prompt_tokens,
            completion.usage.completion_tokens,
        )
        return ChatResponse(reply=reply, persona=req.persona)
    except Exception as e:
        msg = str(e)
        logger.error("Groq error: %s", msg)
        if "401" in msg or "Unauthorized" in msg:
            raise HTTPException(status_code=401, detail="Invalid Groq API key")
        if "429" in msg or "rate" in msg.lower():
            raise HTTPException(status_code=429, detail="Rate limit reached. Try again in a few seconds.")
        raise HTTPException(status_code=502, detail="LLM provider error. Please retry.")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
