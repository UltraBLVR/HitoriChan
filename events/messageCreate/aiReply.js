// events/messageCreate/aiReply.js

const { queryGroq } = require("../../ai/groq");
const AiMsgHistory = require("../../models/aiMsgHistory");


module.exports = async (client, message) => {
  if (!message) return;
  if (message.author.bot) return;

  const mention = `<@${client.user.id}>`;
  let shouldReply = false;
  let userMessage = message.content;

  if (message.content.includes(mention)) {
    userMessage = userMessage.replaceAll(mention, "").trim();
    shouldReply = true;
  }

  if (
    !shouldReply &&
    message.reference &&
    message.reference.messageId
  ) {
    try {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
      if (repliedMessage.author.id === client.user.id) {
        shouldReply = true;
        userMessage = userMessage.trim();
      }
    } catch (err) {
      // Ignore fetch errors
    }
  }

  if (shouldReply && userMessage) {
    await message.channel.sendTyping();

    // --- AI message history logic ---
    const userId = message.author.id;
    const guildId = message.guild ? message.guild.id : "dm";
    let historyDoc = await AiMsgHistory.findOne({ userId, guildId });
    if (!historyDoc) {
      historyDoc = new AiMsgHistory({ userId, guildId, messages: [] });
    }

    // Add the new message to history
    historyDoc.messages.push({ role: "user", content: userMessage });
    // Keep only the last 10 messages
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
  } else if (shouldReply && !userMessage) {
    return message.reply("yo, reply with a message 👀");
  }
};
