const { queryGroq } = require("../../ai/groq");
const messageHistory = require("../../models/messageHistory");
const AiMsgHistory = require("../../models/messageHistory");
const { checkCooldown } = require("../../utils/cooldowns");

module.exports = async (client, message) => {
  if (!message?.content || message.author.bot) return;

  const mention = `<@${client.user.id}>`;
  let shouldReply = false;
  let userMessage = message.content;

  // Check for direct mention
  if (message.content.includes(mention)) {
    userMessage = userMessage.replaceAll(mention, "").trim();
    shouldReply = true;
  } else if (message.reference?.messageId) {
    try {
      const repliedMessage = await message.channel.messages.fetch(
        message.reference.messageId
      );
      if (repliedMessage.author.id === client.user.id) {
        shouldReply = true;
        userMessage = userMessage.trim();
      }
    } catch (err) {
      // Ignore fetch errors
      return;
    }
  }

  if (!shouldReply) return;

  const cooldownLeft = checkCooldown(message.author.id, "ai_reply", 5000);
  if (cooldownLeft > 0) {
    return message.reply(
      `Please wait ${cooldownLeft} seconds before asking me again!`
    );
  }

  if (!userMessage) return;

  try {
    await message.channel.sendTyping();

    // --- AI message history logic ---
    const userId = message.author.id;
    const guildId = message.guild ? message.guild.id : "dm";
    let historyDoc = await AiMsgHistory.findOne({ userId, guildId });
    if (!historyDoc) {
      historyDoc = new messageHistory({ userId, guildId, messages: [] });
    }

    // Add the new message to history
    historyDoc.messages.push({ role: "user", content: userMessage });
    if (historyDoc.messages.length > 10) {
      historyDoc.messages = historyDoc.messages.slice(-10);
    }
    await historyDoc.save();

    // Prepare context for the AI
    const contextMessages = historyDoc.messages.map(m => m.content).join("\n");
    const aiInput = contextMessages;

    const reply = await queryGroq(aiInput);

    // Add the bot's reply to history
    historyDoc.messages.push({ role: "assistant", content: reply });
    if (historyDoc.messages.length > 10) {
      historyDoc.messages = historyDoc.messages.slice(-10);
    }
    await historyDoc.save();

    await message.reply(reply);
  } catch (error) {
    console.error("AI reply error:", error);
    await message.reply("Sorry, I'm having trouble thinking right now! 🤔");
  }
};
