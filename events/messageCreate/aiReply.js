// events/messageCreate/aiReply.js
const { queryGroq } = require("../../ai/groq");

module.exports = async (client, message) => {
  if (!message) return;
  if (message.author.bot) return;

  // Reply if the bot is mentioned anywhere in the message
  const mention = `<@${client.user.id}>`;
  let shouldReply = false;
  let userMessage = message.content;

  if (message.content.includes(mention)) {
    userMessage = userMessage.replaceAll(mention, "").trim();
    shouldReply = true;
  }

  // Reply if the message is a reply to the bot
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
    const reply = await queryGroq(userMessage);
    await message.reply(reply);
  } else if (shouldReply && !userMessage) {
    return message.reply("yo, reply with a message 👀");
  }
};
