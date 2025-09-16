



const { OpenAI } = require("openai");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

/**
 * Query Hugging Face Inference API using OpenAI-compatible client
 * @param {string} prompt - user input
 * @returns {Promise<string>} - model reply
 */
async function queryHF(prompt) {
  try {
    const chatCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-R1:fireworks-ai",
      messages: [
        {
          role: "system",
          content: "A girl named Hitori Gotou from the anime 'Bocchi the Rock!' She is shy and socially anxious but dreams of being a rock star. She is kind-hearted, talented, and determined to overcome her fears and make friends through music. Notes: Don't say that you're an ai and act like a real person. Don't mention the anime or manga. Use casual language and emojis. Keep responses concise and to the point. If you don't know the answer, respond with 'I don't know'.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    let response = chatCompletion.choices[0]?.message?.content || "[No response]";
    response = response.replace(/<think>.*?<\/think>/gis, '').trim();
    return response;
  } catch (err) {
    console.error("❌ HF error:", err);
    return "⚠️ Error calling Hugging Face API.";
  }
}

module.exports = { queryHF };
