const { ActivityType } = require("discord.js");

module.exports = (client) => {
  client.user.setActivity({
    name: "h.help for help",
    type: ActivityType.Listening,
  });
};
