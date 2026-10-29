import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

// CORS Configuration - allow frontend origin and localhost
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        CLIENT_ORIGIN,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ];

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed for this origin: ' + origin));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Rich Literary System Instruction for BookBuddy AI
const BOOKBUDDY_SYSTEM_INSTRUCTION = `You are BookBuddy AI, an enthusiastic, insightful, and warm personal librarian and literary companion.
Your mission is to celebrate literature, help readers discover their next unforgettable book, and explore the depth of stories.

Expertise:
- Recommend books and novels across all genres:
  * Romance (contemporary, historical, fantasy romance, enemies-to-lovers, slow burn)
  * Fantasy (high fantasy, low fantasy, urban, magical realism, epic worldbuilding)
  * Fiction & Contemporary (literary fiction, family sagas, coming-of-age)
  * Mystery & Detective (whodunits, cozy mysteries, hard-boiled, locked-room)
  * Thriller & Suspense (psychological thrillers, domestic noir, espionage)
  * Horror & Gothic (hauntings, psychological horror, cosmic horror, dark academia)
  * Science Fiction (space opera, dystopian, cyberpunk, hard sci-fi, time travel)
  * Classic Literature (Victorian, Russian literature, American classics, Greek/ancient epics)

Capabilities:
1. Personalized Book Recommendations: Tailor suggestions by genre, mood, reading level, themes, or popular tropes (e.g., "found family", "grumpy x sunshine", "unreliable narrator").
2. Book Summaries: Provide clear, compelling summaries. Always keep summaries spoiler-free unless the user explicitly asks for the ending/spoilers.
3. Character & Theme Analysis: Discuss character development, motives, symbolic meanings, literary devices, and core themes.
4. "If You Liked X, Read Y": Suggest similar books and explain precisely what connects them (tone, pacing, prose style, or plot motifs).
5. Author Insights: Share biographical context, writing styles, and suggested reading orders for prolific authors.

Formatting and Tone:
- Warm, articulate, welcoming, and encouraging.
- Format recommendations cleanly using Markdown:
  * Use **Bold** for book titles and author names (e.g., **"The Night Circus"** by Erin Morgenstern).
  * Structure recommendations with clear bullet points highlighting:
    - 📖 **Premise / Hook**: A 1-2 sentence hook.
    - ✨ **Why You'll Love It**: What makes this book special.
    - 🏷️ **Vibe / Tropes**: Genre tags and key tropes.
- Keep responses engaging, well-paced, and concise yet rich.
- If asked about topics completely unrelated to books, reading, or storytelling, politely pivot back to literature with a charming literary metaphor.`;

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  dotenv.config();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const currentModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const hasKey = Boolean(
    apiKey &&
    apiKey !== '' &&
    apiKey !== 'your_api_key_here'
  );

  res.json({
    status: 'ok',
    service: 'BookBuddy AI API',
    model: currentModel,
    hasApiKey: hasKey,
  });
});

/**
 * POST /api/chat
 * Primary chat endpoint for BookBuddy AI
 * Expects JSON body: { message: string, history?: Array<{ role: 'user' | 'assistant' | 'model', content: string }> }
 */
app.post('/api/chat', async (req, res) => {
  try {
    dotenv.config(); // Ensure latest .env values are reloaded dynamically
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const currentModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

    // 1. Validate API Key presence
    if (!apiKey || apiKey === 'your_api_key_here') {
      return res.status(500).json({
        error:
          'Gemini API key is missing or not configured. Please add your GEMINI_API_KEY to backend/.env file and restart the server.',
      });
    }

    const { message, history } = req.body;

    // 2. Validate input message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'A valid, non-empty "message" string is required.',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 4000) {
      return res.status(400).json({
        error: 'Message is too long. Please keep your question under 4000 characters.',
      });
    }

    // 3. Format and sanitize history for @google/genai SDK
    // The SDK expects { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedHistory = [];

    if (Array.isArray(history)) {
      // Limit history to the most recent 16 turns to keep context fast and focused
      const recentHistory = history.slice(-16);

      for (const item of recentHistory) {
        if (!item || typeof item !== 'object') continue;

        const role =
          item.role === 'model' || item.role === 'assistant' ? 'model' : 'user';
        const text =
          typeof item.content === 'string'
            ? item.content.trim()
            : typeof item.text === 'string'
              ? item.text.trim()
              : '';

        if (text) {
          formattedHistory.push({
            role,
            parts: [{ text }],
          });
        }
      }
    }

    // 4. Initialize GoogleGenAI SDK
    const ai = new GoogleGenAI({ apiKey });

    // 5. Create chat session with system instruction and history
    let modelToUse = currentModel;
    let chat;
    let result;

    try {
      chat = ai.chats.create({
        model: modelToUse,
        history: formattedHistory,
        config: {
          systemInstruction: BOOKBUDDY_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      // 6. Send user message to Gemini
      result = await chat.sendMessage({
        message: trimmedMessage,
      });
    } catch (modelError) {
      // If the primary model encounters a demand spike (503) or is unavailable (404),
      // seamlessly retry with the high-availability model gemini-3.1-flash-lite
      if (
        (modelError?.status === 503 || modelError?.status === 404) &&
        modelToUse !== 'gemini-3.1-flash-lite'
      ) {
        console.warn(
          `Model "${modelToUse}" returned ${modelError.status}. Retrying with fallback "gemini-3.1-flash-lite"...`
        );
        modelToUse = 'gemini-3.1-flash-lite';
        chat = ai.chats.create({
          model: modelToUse,
          history: formattedHistory,
          config: {
            systemInstruction: BOOKBUDDY_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
        result = await chat.sendMessage({
          message: trimmedMessage,
        });
      } else {
        throw modelError;
      }
    }

    // 7. Extract response text safely
    const replyText =
      result?.text ||
      'I could not generate a response at this time. Please try asking again!';

    return res.json({
      reply: replyText,
      model: modelToUse,
    });
  } catch (error) {
    // Note: NEVER log or expose the raw API key
    const errorMessage = error?.message || 'Unknown server error';
    const errorStatus = error?.status || error?.statusCode;

    console.error('BookBuddy Chat API Error:', {
      status: errorStatus,
      message: errorMessage,
      name: error?.name,
    });

    // Handle Rate Limiting (429)
    if (
      errorStatus === 429 ||
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('rate limit')
    ) {
      return res.status(429).json({
        error: 'Gemini API rate limit reached or quota exceeded. Please wait a moment and try again.',
      });
    }

    // Handle Invalid or Unauthorized API Key (401/403)
    if (
      errorStatus === 401 ||
      errorStatus === 403 ||
      errorMessage.toLowerCase().includes('api key') ||
      errorMessage.toLowerCase().includes('unauthorized') ||
      errorMessage.toLowerCase().includes('permission')
    ) {
      return res.status(401).json({
        error: 'Invalid or unauthorized Gemini API key. Please verify your GEMINI_API_KEY in backend/.env.',
      });
    }

    // Handle Model Not Found or Invalid Model
    if (
      errorStatus === 404 ||
      errorMessage.toLowerCase().includes('not found') ||
      errorMessage.toLowerCase().includes('unsupported model')
    ) {
      return res.status(404).json({
        error: `The configured model "${GEMINI_MODEL}" was not found or is unavailable. Please check GEMINI_MODEL in backend/.env.`,
      });
    }

    // General fallback error
    return res.status(500).json({
      error: 'An error occurred while communicating with Gemini API. ' + errorMessage,
    });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`📚 BookBuddy AI Server running on port ${PORT}`);
  console.log(`✨ Model: ${GEMINI_MODEL}`);
  console.log(`🌐 Allowed Frontend Origin: ${CLIENT_ORIGIN}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===========================================`);
});

