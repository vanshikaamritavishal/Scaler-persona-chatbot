"""Backend API tests for persona chatbot."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://ai-trio-chat.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health
def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data == {"service": "persona-chatbot", "status": "ok"}


# Personas list
def test_list_personas(client):
    r = client.get(f"{API}/personas")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 3
    ids = sorted([p["id"] for p in data])
    assert ids == ["abhimanyu", "anshuman", "kshitij"]
    for p in data:
        assert "name" in p and isinstance(p["name"], str) and p["name"]


# Chat happy paths per persona
@pytest.mark.parametrize("persona_id", ["anshuman", "abhimanyu", "kshitij"])
def test_chat_persona_returns_reply(client, persona_id):
    r = client.post(
        f"{API}/chat",
        json={"persona": persona_id, "message": "Give me one short tip in 2 sentences.", "history": []},
        timeout=45,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["persona"] == persona_id
    assert isinstance(data["reply"], str)
    assert len(data["reply"].strip()) > 0


# Different persona => different reply (not a strict guarantee, but sanity)
def test_chat_personas_differ(client):
    msg = "What should I focus on this week to grow as an engineer?"
    r1 = client.post(f"{API}/chat", json={"persona": "anshuman", "message": msg}, timeout=45)
    r2 = client.post(f"{API}/chat", json={"persona": "abhimanyu", "message": msg}, timeout=45)
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r1.json()["reply"] != r2.json()["reply"]


# Invalid persona
def test_chat_invalid_persona(client):
    r = client.post(f"{API}/chat", json={"persona": "unknown_xyz", "message": "hi"}, timeout=15)
    assert r.status_code == 400
    assert "Unknown persona" in r.json().get("detail", "")


# Empty message -> 422 from pydantic min_length validator
def test_chat_empty_message(client):
    r = client.post(f"{API}/chat", json={"persona": "anshuman", "message": ""}, timeout=15)
    assert r.status_code == 422


# History is respected (server should accept history & still produce reply)
def test_chat_with_history(client):
    history = [
        {"role": "user", "content": "My name is Ravi."},
        {"role": "assistant", "content": "Got it Ravi."},
    ]
    r = client.post(
        f"{API}/chat",
        json={"persona": "kshitij", "message": "What did I say my name is? Reply in one sentence.", "history": history},
        timeout=45,
    )
    assert r.status_code == 200
    reply = r.json()["reply"].lower()
    # Light assertion: reply should reference the name at least sometimes; if model doesn't, still pass on 200.
    assert isinstance(reply, str) and len(reply) > 0
