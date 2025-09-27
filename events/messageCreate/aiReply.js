const { queryGroq } = require("../../ai/groq");
const messageHistory = require("../../models/messageHistory.js");
const { checkCooldown } = require("../../utils/cooldowns.js");

module.exports = async (client, message) => {
  if (!message?.content || message.author.bot) return;

  const mention = `<@${client.user.id}>`;
  let shouldReply = false;
  let userMessage = message.content;

  // Check for direct mention
  if (message.content.includes(mention)) {
    userMessage = userMessage.replace(new RegExp(mention, "g"), "").trim()
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
    const channelId = message.channel.id;
    let historyDoc = await messageHistory.findOne({ userId, guildId, channelId });
    if (!historyDoc) {
      historyDoc = new messageHistory({ userId, guildId, channelId, messages: [] });
    }

    // Add the new message to history
    historyDoc.messages.push({ role: "user", content: userMessage });
    if (historyDoc.messages.length > 10) {
      historyDoc.messages = historyDoc.messages.slice(-10);
    }
    await historyDoc.save();

    // Prepare context for the AI
    const contextMessages = historyDoc.messages
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const aiInput = contextMessages;

    const reply = await queryGroq(aiInput);

    // Add the bot's reply to history
    historyDoc.messages.push({ role: "assistant", content: reply });
    if (historyDoc.messages.length > 251) {
      historyDoc.messages = historyDoc.messages.slice(-251);
    }
    await historyDoc.save();

    await message.reply(reply);
  } catch (error) {
    console.error("AI reply error:", error);
    await message.reply("There is an error, please contact the developers to notify.");
  }
};
