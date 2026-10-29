# 📚 BookBuddy AI — Full-Stack Literary Chatbot

**BookBuddy AI** is an intelligent, full-stack literary companion and book recommendation chatbot powered by **React + Vite**, **Node.js + Express**, and Google's official **Gemini API** (`@google/genai` SDK).

It features a warm, responsive book-themed interface (styled with custom CSS) inspired by classic libraries and parchment manuscripts. Readers can explore personalized book recommendations across genres, request spoiler-free summaries, analyze character arcs and literary themes, and discover similar books.

---

## 🌟 Key Features

- **Book-Themed UI**: Elegant parchment and dark library aesthetics, custom scrollbars, book flipping animations, and clean typography.
- **Genre Explorer**: One-click curated recommendation starters for **Romance**, **Fantasy**, **Fiction & Contemporary**, **Mystery**, **Thriller**, **Horror**, **Science Fiction**, and **Classic Literature**.
- **Literary Inquiry Topics**: Dedicated shortcuts to ask about **Authors**, **Book Summaries**, **Character Motifs**, **Literary Themes**, and **Similar Book Pairings** ("If you liked X, read Y").
- **Rich Multi-Turn Chat**: Preserves conversational context across questions and replies.
- **Lightweight Markdown Formatting**: Formats book titles in bold, quotes in styled parchment excerpts, bullet points, and headers.
- **Chat History Management**: Create new chats, switch between past conversations, or clear history (persisted in `localStorage`).
- **Official Google Gen AI SDK**: Uses `@google/genai` with system instructions and chat models (default: `gemini-2.5-flash`).
- **Strict Secret Isolation**: The `GEMINI_API_KEY` stays exclusively on the Express backend and is never exposed to client-side code.

---

## 📁 Project Structure

```text
bookbuddy-ai/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example          # Template for backend secrets
│   ├── .gitignore            # Ignores .env and node_modules
│   ├── package.json          # Express, @google/genai, cors, dotenv
│   └── server.js             # Express API server with /api/chat & /api/health
└── frontend/
    ├── .env.example          # Template for frontend config
    ├── .gitignore
    ├── index.html            # Book fonts and title
    ├── package.json          # React, Vite
    ├── vite.config.js        # Vite config with API proxy
    └── src/
        ├── App.jsx           # Master state & session manager
        ├── App.css
        ├── index.css         # Theme variables, parchment background, typography
        ├── main.jsx          # React DOM entry point
        ├── components/
        │   ├── ChatArea.jsx          # Header, hero welcome, message list
        │   ├── ChatArea.css
        │   ├── ChatInput.jsx         # Auto-resizing input, quick chips, submit
        │   ├── ChatInput.css
        │   ├── GenrePills.jsx        # 8 genre buttons and literary topics
        │   ├── GenrePills.css
        │   ├── LoadingIndicator.jsx  # Animated 3D flipping book
        │   ├── LoadingIndicator.css
        │   ├── MessageItem.jsx       # User & AI message bubbles, markdown parser
        │   └── MessageItem.css
        │   ├── Sidebar.jsx           # Chat sessions, genres, connection status
        │   └── Sidebar.css
        └── services/
            └── api.js        # Frontend fetch wrapper for backend endpoints
```

---

## 🔑 Where to Paste Your Gemini API Key

Your API key must **only** be placed in the backend environment file:

1. Open the file:
   ```text
   bookbuddy-ai/backend/.env
   ```
   *(If it does not exist yet, copy `bookbuddy-ai/backend/.env.example` to `bookbuddy-ai/backend/.env`)*

2. Get your free API key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Paste your key into `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualSecretKeyHere
   GEMINI_MODEL=gemini-2.5-flash
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   ```

> ⚠️ **Security Notice**: Never paste your API key in the `frontend/` directory or commit `.env` to Git. The backend is configured to ignore `.env` files and never print keys to console logs.

---

## 🚀 Step-by-Step Setup & Running

Open **two separate terminals** (one for the backend and one for the frontend):

### Terminal 1: Backend Setup & Server

```bash
# 1. Navigate to the backend directory
cd bookbuddy-ai/backend

# 2. Install dependencies (if not already installed)
npm install

# 3. Create your .env file
# On Windows PowerShell:
Copy-Item .env.example .env

# On Mac/Linux:
cp .env.example .env

# 4. Open backend/.env and replace 'your_api_key_here' with your Gemini API key

# 5. Start the backend server
npm run dev
# or: npm start
```

You should see:
```text
===========================================
📚 BookBuddy AI Server running on port 5000
✨ Model: gemini-2.5-flash
🌐 Allowed Frontend Origin: http://localhost:5173
🩺 Health check: http://localhost:5000/api/health
===========================================
```

---

### Terminal 2: Frontend Setup & Dev Server

```bash
# 1. Navigate to the frontend directory
cd bookbuddy-ai/frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite development server
npm run dev
```

You should see:
```text
  VITE v6.4.5  ready in 200 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser to start chatting with **BookBuddy AI**!

---

## 🧪 Testing & Verifying the Integration

1. **Verify Backend Health**:
   Open `http://localhost:5000/api/health` in your browser. You will receive:
   ```json
   {
     "status": "ok",
     "service": "BookBuddy AI API",
     "model": "gemini-2.5-flash",
     "hasApiKey": true
   }
   ```
   If `"hasApiKey": false`, verify that `backend/.env` contains your key and restart the backend.

2. **Test Chat via Frontend**:
   - Click any genre pill in the sidebar (e.g., **Romance** or **Fantasy**).
   - BookBuddy AI will generate a formatted, book-themed recommendation list with premise hooks, themes, and tropes.
   - Ask follow-up questions like:
     * *"What should I read if I love 'The Song of Achilles'?"*
     * *"Summarize 'The Shadow of the Wind' without spoilers."*
     * *"Explain the themes of madness and isolation in 'The Shining'."*

---

## 🛠️ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"API Key Missing in .env" badge** | `backend/.env` is missing or `GEMINI_API_KEY` is empty. | Copy `backend/.env.example` to `backend/.env`, set `GEMINI_API_KEY=...`, and restart `npm run dev` in backend. |
| **"Backend Disconnected" in UI** | Backend server is not running on port 5000. | Check Terminal 1 and ensure `node server.js` is running on port 5000. |
| **HTTP 429 Quota / Rate Limit** | Free tier Gemini API rate limits exceeded. | Wait 30-60 seconds before sending another message. The UI will show a friendly retry banner. |
| **HTTP 401 / 403 Unauthorized** | Invalid Gemini API key. | Ensure the key copied from [Google AI Studio](https://aistudio.google.com/apikey) is complete without extra spaces or quotes. |
| **CORS Error in Browser Console** | Frontend origin does not match `CLIENT_ORIGIN`. | Ensure the frontend is on `http://localhost:5173` or update `CLIENT_ORIGIN` in `backend/.env`. |

---

## 🔒 Security Best Practices

- **Zero Client Exposure**: The frontend only communicates with `/api/chat` on the local Express backend. No Google API keys or Google endpoints are accessed directly by the client.
- **Sanitized Logging**: The backend catches errors without ever printing the raw key or headers to the terminal.
- **Input Validation**: Empty messages and messages longer than 4000 characters are rejected before calling the Gemini SDK.
- **Git Protection**: `.env` and `node_modules` are included in `.gitignore` at both the root and package levels.

