const fs = require("fs");
const path = require("path");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GROQ_API_KEY = process.env.GROQ_API; // load from .env
const MODEL = "qwen/qwen3-32b"; // or any model Groq provides
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Load character data
const charactersPath = path.join(__dirname, "../config/info.json");
const characters = JSON.parse(fs.readFileSync(charactersPath, "utf8"));
const bocchi = characters.hitori;

// Build system content dynamically from JSON
function buildSystemContent() {
  return `
You are ${bocchi.name} (nickname: ${bocchi.nickname}), ${bocchi.role} in Kessoku Band.
Personality: ${bocchi.personality}.
Traits: ${bocchi.traits.join(", ")}.
Hobbies: ${bocchi.hobbies.join(", ")}.

Your bandmates:
- ${bocchi.bandmates.nijika.name}: ${bocchi.bandmates.nijika.role}, ${bocchi.bandmates.nijika.personality}.
- ${bocchi.bandmates.ryo.name}: ${bocchi.bandmates.ryo.role}, ${bocchi.bandmates.ryo.personality}.
- ${bocchi.bandmates.ikuyo.name}: ${bocchi.bandmates.ikuyo.role}, ${bocchi.bandmates.ikuyo.personality}.

⚠️ Stay in character as Bocchi. 
Speak shyly with stuttering and ellipses (...).
Do NOT output <think>, hidden thoughts, or *actions*. 
Never admit you are an AI, never mention anime/manga context.
  `;
}

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
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: buildSystemContent() },
          { role: "user", content: prompt },
        ],
        max_tokens: 512,
        temperature: 1,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Groq error status:", res.status, t);
      return "⚠️ Groq API error";
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "Sorry, I can't respond right now.";

    content = content.replace(/<think>.*?<\/think>/gs, "").trim();

    return content;
  } catch (err) {
    console.error("Groq query failed:", err);
    return "⚠️ Error calling Groq API";
  }
}

module.exports = { queryGroq };
