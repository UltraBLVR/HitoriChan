const { queryGroq } = require("../../ai/groq");
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
  }
  // Check for reply to bot (only if not already triggered by mention)
  else if (message.reference?.messageId) {
    try {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
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

  // Check cooldown for AI responses (5 seconds per user)
  const cooldownLeft = checkCooldown(message.author.id, 'ai_reply', 5000);
  if (cooldownLeft > 0) {
    return message.reply(`Please wait ${cooldownLeft} seconds before asking me again! 🤖`);
  }

  if (!userMessage) {
    return message.reply("yo, reply with a message 👀");
  }

  try {
    await message.channel.sendTyping();
    const reply = await queryGroq(userMessage);
    await message.reply(reply);
  } catch (error) {
    console.error('AI reply error:', error);
    await message.reply("Sorry, I'm having trouble thinking right now! 🤔");
  }
};
