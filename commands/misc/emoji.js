
const { ApplicationCommandOptionType } = require("discord.js");
const EmojiHandler = require("../../utils/emojiHandler");

module.exports = {
  name: "emoji",
  description: "Use and get information about emojis (animated or static)",
  options: [
    {
      name: "action",
      description: "What to do with the emoji",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "show",
          value: "show"
        },
        {
          name: "info",
          value: "info"
        },
        {
          name: "react",
          value: "react"
        }
      ]
    },
    {
      name: "emoji",
      description: "Emoji name, ID, or unicode emoji",
      required: true,
      type: ApplicationCommandOptionType.String
    }
  ],

  callback: async (client, interaction) => {
    const action = interaction.options.getString("action");
    const emojiIdentifier = interaction.options.getString("emoji");
    
    const emojiHandler = new EmojiHandler(client);

    try {
      switch (action) {
        case "show":
          await interaction.deferReply();
          const formattedEmoji = emojiHandler.getEmoji(emojiIdentifier, interaction.guild.id);
          await interaction.editReply(`Here's your emoji: ${formattedEmoji}`);
          break;

        case "info":
          await interaction.deferReply();
          const emojiInfo = emojiHandler.getEmojiInfo(emojiIdentifier, interaction.guild.id);
          
          if (!emojiInfo) {
            await interaction.editReply("❌ Emoji not found!");
            return;
          }

          const infoMessage = [
            `**Emoji Information:**`,
            `Name: ${emojiInfo.name}`,
            `ID: ${emojiInfo.id || "N/A (Unicode)"}`,
            `Animated: ${emojiInfo.animated ? "Yes" : "No"}`,
            `Unicode: ${emojiInfo.unicode ? "Yes" : "No"}`,
            `Formatted: ${emojiInfo.formatted}`,
            emojiInfo.url ? `URL: ${emojiInfo.url}` : ""
          ].filter(line => line).join("\n");

          await interaction.editReply(infoMessage);
          break;

        case "react":
          await interaction.deferReply();
          const reactionResult = await emojiHandler.reactWithEmoji(
            await interaction.fetchReply(), 
            emojiIdentifier, 
            interaction.guild.id
          );
          
          if (reactionResult) {
            await interaction.editReply("✅ Successfully reacted with the emoji!");
          } else {
            await interaction.editReply("❌ Failed to react with the emoji!");
          }
          break;
      }
    } catch (error) {
      console.log(`Error in emoji command: ${error}`);
      await interaction.editReply("❌ An error occurred while processing the emoji!");
    }
  }
};
