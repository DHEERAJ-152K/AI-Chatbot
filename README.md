# AI-Chatbot

AI-powered customer support chat with React frontend and Node.js/TypeScript backend using **Google Gemini 2.0 Flash** and **SQLite**.

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- Google API Key from https://aistudio.google.com/app/apikey

### Backend Setup

```bash
cd server
npm install

# Create .env file
# Add your GOOGLE_API_KEY to .env

npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Database Setup

**No manual setup required!** SQLite database (`chat.db`) is automatically created on first run.

**Schema:**
```sql
conversations (id, created_at, metadata)
messages (id, conversation_id, sender, text, timestamp)
```

**Reset database:** Delete `backend/chat.db` and restart server.

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000 or 3000
NODE_ENV=development
GOOGLE_API_KEY=your_google_api_key_here
```


---

## 🏗️ Architecture Overview

### Backend Structure - Layered Design

```
Routes (API endpoints)
    ↓
Controllers (HTTP handling)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
Database (SQLite)
```

### Folder Structure

```
backend/src/
├── routes/           # API endpoint definitions
├── controllers/      # Request/response handling
├── services/         # Business logic + LLM integration
├── repositories/     # Database operations
├── db/              # SQLite implementation
├── middleware/       # Validation, error handling
└── types/           # TypeScript types
```

### Key Design Decisions

**1. Layered Architecture**
- Clean separation of concerns
- Easy to test and maintain
- Can swap any layer independently

**2. Repository Pattern**
- Database-agnostic code
- Easy migration (SQLite → PostgreSQL) RDBMS
- Clean data access interface

**3. Service Encapsulation**
- LLM logic isolated in `llmService`
- Easy to switch AI providers
- Centralized prompt management

**4. Middleware Pipeline**
- Input validation before business logic
- Consistent error handling
- Ready for authentication

---

## 🤖 LLM Integration

### Provider: Google Gemini 2.0 Flash

**Model:** `gemini-2.0-flash`

**Why Gemini?**
- Fast responses 
- Free during preview (with limited RPM)
- Excellent instruction following
- Built-in safety filters

### Prompting Strategy

**System Instruction:** Store knowledge (shipping, returns, support hours, payments, warranty) provided as system prompt.

**Conversation History:** Last 10 messages sent for context.

**Configuration:**
```typescript
{
  maxOutputTokens: 500,     // Control response length
  temperature: 0.7          // Balance creativity/consistency
}
```

**Sample Prompt Flow:**
```
System: "You are a support agent for TechHub Store..."
History: [last 10 messages]
User: "How long does shipping take?"
→ AI generates contextual response
```

**Error Handling:**
- Invalid API key → Clear error message
- Rate limits → User-friendly retry message
- Safety filters → Polite deflection
- Network errors → Graceful fallback

---

## ⚖️ Trade-offs & Design Choices

### Trade-offs Made

**SQLite vs PostgreSQL**
- ✅ Chose: SQLite
- Why: Zero configuration, perfect for demo/MVP
- Trade-off: Limited concurrency vs full-featured RDBMS
- Migration path: Repository pattern makes PostgreSQL swap trivial

**In-Memory History vs Full Context**
- ✅ Chose: Last 10 messages only
- Why: Balance context quality with cost/performance
- Trade-off: Older context lost vs unbounded token usage

**Single LLM Provider**
- ✅ Chose: Gemini only
- Why: Fast, free, simple integration
- Trade-off: Vendor lock-in vs abstraction complexity
- Note: Service layer makes provider swap easy


---

## 🚧 If I Had More Time...

### Database
- **PostgreSQL migration** with ORM
- **Redis caching** for conversation history
- **Database indexes optimization** for scale
- **Backup/restore** automation

### Features
- **Multi-channel support**: WhatsApp, Instagram DM integration
- **File uploads**: Support images, documents in chat
- **Agent handoff**: Escalate to human support on request
- **Sentiment analysis**: Detect frustrated users

### LLM Enhancements
- **Function calling**: Order lookup, tracking, cancellation
- **Multi-provider fallback**: Gemini → OpenAI → Claude

### Production Readiness
- **Authentication**: JWT-based user auth
- **Rate limiting**: Per-user API quotas with Redis
- **Monitoring**: Logging (Winston), metrics (Prometheus)
- **CI/CD**: GitHub Actions pipeline
- **API documentation**: OpenAPI/Swagger 

### UX Improvements
- **Voice input**: Speech-to-text integration
- **Suggested replies**: Context-aware quick responses
- **Rich messages**: Cards, carousels, buttons
- **Multi-language**: With auto-detection

### Performance
- **Response caching**: Cache common questions
- **CDN integration**: Static asset delivery
- **Load balancing**: Horizontal scaling

---

## 📊 Current Limitations

- **Concurrency**: SQLite handles moderate load only
- **No Auth**: Anonymous conversations only
- **Single Region**: No geographic redundancy
- **No Monitoring**: Manual log inspection

All limitations have clear upgrade paths documented above.

---

## 🎯 What's Production-Ready

✅ **Core functionality**: Complete chat flow works  
✅ **Error handling**: Graceful failures, no crashes  
✅ **Input validation**: All edge cases covered  
✅ **Code quality**: Clean, typed, well-structured  
✅ **Database**: ACID compliant with proper schema  
✅ **Extensibility**: Easy to add channels/features  

---
