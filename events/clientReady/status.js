const { ActivityType } = require("discord.js");

module.exports = (client) => {
  client.user.setActivity({
    name: "*help for help",
    type: ActivityType.Listening,
  });
};
