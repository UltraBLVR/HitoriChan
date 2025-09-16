const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js")

module.exports = {

  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("user").value;
    const reason = interaction.options.get("reason")?.value || "No reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    };

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply("THE FUVK YOU TRYING TO KICK THE OWNER? LIKE FR?!!?!?!?!!");
      
      return; 
    }
    

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply("You can't kick that user because they have the same or higher role than you.");
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply("I can't lick that user because they have the same or higher role than me.");
      return;
    }

    try {
      await targetUser.kick( reason );
      await interaction.editReply(`User ${targetUser} was kicked\nReason: ${reason}`);

    } catch (error) {
        console.log(`There was an error when kicking: ${error}`);
    }
  },

  name: "kick",
  description: "Kicks a user from the server",
  options: [
    {
      name: "user",
      description: "The user to kick",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "reason",
      description: "Resin to lick",
      required: false,
      type: ApplicationCommandOptionType.String
    }
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.Administrator],


}