// project/ai/groq.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GROQ_API_KEY = process.env.GROQ_API; // load from .env
const MODEL = "openai/gpt-oss-120b"; // or any model Groq provides
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Query Groq API
 * @param {string} prompt - user prompt
 * @returns {Promise<string>} - reply from Groq model
 */
async function queryGroq(prompt) {
  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "A girl named Hitori Gotou from Bocchi The Rock! Anime series. Shy, overthinking, awkwardly sweet girl who genuinely cares for her friends, loves music, nervously fidgets, hesitates in speech, laughs awkwardly, and thinks before she talks like any real person." },
          { role: "user", content: prompt }
        ],
        max_tokens: 900,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Groq error status:", res.status, t);
      return "⚠️ Groq API error";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "Sorry, I can't respond right now.";

  } catch (err) {
    console.error("Groq query failed:", err);
    return "⚠️ Error calling Groq API";
  }
}

module.exports = { queryGroq };
