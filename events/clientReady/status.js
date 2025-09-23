const { ActivityType } = require("discord.js");

module.exports = (client) => {
  client.user.setActivity({
    name: "| For help, type /help, nothing special lol 😭",
    type: ActivityType.Watching,
  });
};
