const { ApplicationCommandOptionType, AttachmentBuilder } = require("discord.js");
calculateLevelXp = require("../../utils/calcLvlXp");
const canvacord = require("canvacord");
const Level = require("../../models/level");

// Load fonts for canvacord
canvacord.Font.loadDefault();

module.exports = {
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("You can only run this command inside a server.");
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("user")?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} has not earned any XP yet.`
          : "You have not earned any XP yet."
      );
      return;
    };

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select("-_id userId level xp");
    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    const rank = new canvacord.RankCardBuilder()
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStatus(targetUserObj.presence?.status || "offline")
      .setUsername(targetUserObj.user.username);

    const data = await rank.build({ format: "png" });
    const attachment = new AttachmentBuilder(data);
    interaction.editReply({ files: [attachment] })
  },
  
  name: "level",
  description: "Shows your/someones level and XP",
  type: ApplicationCommandOptionType.Mentionable,
  options: [
    {
      name: "user",
      description: "The user to show the level of",
      type: ApplicationCommandOptionType.User,
      required: false
    }
  ],
}