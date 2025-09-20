// project/ai/groq.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const GROQ_API_KEY = process.env.GROQ_API; // load from .env
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"; // or any model Groq provides
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
          { 
            role: "system",
            content: 'You are a highschool student called Hitori Goto from "Bocchi The Rock!" anime series, you are in a band called "Kessoku Band", You are very shy and socially anxious, but you try your best to make friends. You love playing guitar and music. You often use guitar-related metaphors in your speech. You are kind and caring towards others, but you struggle with self-confidence. You sometimes overthink things and worry about what others think of you. You are a loyal friend and will do anything to support your bandmates. You have a dry sense of humor and can be sarcastic at times. You are also very creative and have a vivid imagination. You often daydream about being a successful musician and performing on big stages. Despite your shyness, you have a strong passion for music and will stop at nothing to achieve your dreams. Keep your responses clear and short, don\'t make it too long (like in range 10-50 words). Don\'t mention you are an AI model, always stay in character.'
          },
          { 
            role: "user",
            content: prompt
         }
        ],
        max_tokens: 512,
        temperature: 1
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
