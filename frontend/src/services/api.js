/**
 * BookBuddy AI API Service
 * Handles communication with the Express backend
 */

// Configurable API Base URL via Vite environment variable
// Defaults to http://localhost:5000 or the proxied /api route
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

/**
 * Send user message and conversation history to the BookBuddy backend
 * @param {string} message - Current prompt/question
 * @param {Array<{role: string, content: string}>} history - Previous conversation messages
 * @returns {Promise<{reply: string, model: string}>}
 */
export async function sendMessageToGemini(message, history = []) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        `Server returned error ${response.status}: ${response.statusText}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }

    if (!data || typeof data.reply !== 'string') {
      throw new Error('Received an unexpected response structure from BookBuddy server.');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to BookBuddy server at ${BASE_URL}. Please ensure the Node.js backend is running on port 5000.`
      );
    }
    throw error;
  }
}

/**
 * Check backend health and whether GEMINI_API_KEY is configured
 * @returns {Promise<{status: string, model: string, hasApiKey: boolean}>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) return { status: 'error', hasApiKey: false };
    return await response.json();
  } catch (err) {
    return { status: 'offline', hasApiKey: false, error: err.message };
  }
}

export { BASE_URL };

