
const { ApplicationCommandOptionType } = require("discord.js")

module.exports = {
  name: "membercount",
  description: "Shows the server's member count",
  options: [
    {
      name: "type",
      description: "Select the type of count",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: "all",
          value: "all"
        },
        {
          name: "bots",
          value: "bots"
        },
        {
          name: "humans",
          value: "humans"
        }
      ]
    }
  ],

  callback: async (client, interaction) => {
    const value = interaction.options.get("type")?.value || "all";

    if (value === "all") {
      await interaction.reply(`This server has ${interaction.guild.memberCount} members.`);
    } else if (value === "bots") {
      await interaction.reply(`This server has ${interaction.guild.members.cache.filter(member => member.user.bot).size} bots.`);
    } else if (value === "humans") {
      await interaction.reply(`This server has ${interaction.guild.members.cache.filter(member => !member.user.bot).size} humans.`);
    }
  }
}
