# Test Credentials

This app does not require any user authentication. The chatbot is publicly accessible.

## Backend Environment

- `GROQ_API_KEY`: configured in `/app/backend/.env` (working Groq free-tier key)
- `GROQ_MODEL`: `llama-3.3-70b-versatile`
- Backend URL (internal): `http://localhost:8001`
- Backend URL (public): `https://ai-trio-chat.preview.emergentagent.com/api`

## Test data
- 3 valid persona IDs: `anshuman`, `abhimanyu`, `kshitij`
- POST `/api/chat` body: `{ "persona": "anshuman", "message": "How do I crack MAANG?", "history": [] }`
