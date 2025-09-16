const { queryHF } = require("../../ai/huggingface.js");

module.exports = async (client, message) => {
  if (message.author.bot) return;

  if (message.reference && message.reference.messageId) {
    try {
      
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
      if (repliedMessage.author.id === client.user.id) {
        const userMessage = message.content.trim();
        if (!userMessage) {
          return;
        }
        await message.channel.sendTyping();
        const reply = await queryHF(userMessage);
        await message.reply(reply);
        return;
      }
    } catch (err) {
      // Ignore fetch errors
    }
  }

  // only trigger if bot is mentioned at the start
  if (message.content.startsWith(`<@${client.user.id}>`)) {
    const userMessage = message.content.replace(`<@${client.user.id}>`, "").trim();

    if (!userMessage) {
      return;
    }
    await message.channel.sendTyping();
    const reply = await queryHF(userMessage);
    await message.reply(reply);
    return;
  }
};
