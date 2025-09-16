
const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "timeout",
  description: "Timeouts a user",
  options: [
    {
      name: "user",
      description: "The user to timeout",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "duration",
      description: "Duration of the timeout (ex. 1m, 1d, 1w ...etc)",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "reason",
      description: "Reason for the timeout",
      required: false,
      type: ApplicationCommandOptionType.String,
    }
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],

  callback: async (client, interaction) => {
    const mentionable = interaction.options.get("user").value;
    const duration = interaction.options.get("duration").value;
    const reason = interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(mentionable);
    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply("I can't timeout a bot.");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply("I know hes annoying but you can't timeout em");
      return;
    }

    const ms = require("ms");
    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply("Please provide a valid duration.");
      return;
    }

    if (msDuration <= 5000 || msDuration >= 2.419e9) {
      await interaction.editReply("Duration cannot be less than 5 seconds or more than 28 days.");
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply("You can't timeout that user because they have the same or higher role than you.");
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply("I can't timeout that user because they have the same or higher role than me.");
      return;
    }

    try {
      const { default: prettyMs } = await import('pretty-ms');

      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        await interaction.editReply(`${targetUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}\nReason: ${reason}`);
      } else {
        await targetUser.timeout(msDuration, reason);
        await interaction.editReply(`${targetUser} has been timed out for ${prettyMs(msDuration, { verbose: true })}\nReason: ${reason}`);
      }
    } catch (error) {
      console.log(`There was an error when timing out: ${error}`);
    }
  }
};
