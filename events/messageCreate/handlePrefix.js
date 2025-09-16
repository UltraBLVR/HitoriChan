const getLocalCommands = require('../../utils/getLocalCommands');
const PrefixHandler = require('../../handlers/prefix');

const prefixHandler = new PrefixHandler('h');

module.exports = async (client, message) => {
  if (message.author.bot) return;

  // Auto-response functionality
  /* copy and paste it out of this comment block to use it.
  if (message.content.toLowerCase() === "hello" || message.content.toLowerCase() === "hi") {
    message.reply("Hello!");
    return;
  };
  */

  await prefixHandler.handleMessage(client, message);
};