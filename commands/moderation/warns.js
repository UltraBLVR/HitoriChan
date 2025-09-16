
const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to warnings file
const warningsPath = path.join(__dirname, '../../config/warnings.json');

// Helper function to read warnings
function readWarnings() {
  try {
    if (!fs.existsSync(warningsPath)) {
      return {};
    }
    const data = fs.readFileSync(warningsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Error reading warnings file:', error);
    return {};
  }
}

module.exports = {
  name: "warns",
  description: "View warnings for a user",
  options: [
    {
      name: "user",
      description: "The user to view warnings for",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    }
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    const targetUser = interaction.options.get('user')?.value;

    if (!targetUser) {
      await interaction.reply('❌ Please specify a user.');
      return;
    }

    const targetMember = await interaction.guild.members.fetch(targetUser).catch(() => null);
    
    if (!targetMember) {
      await interaction.reply('❌ User not found in this server.');
      return;
    }

    try {
      const warnings = readWarnings();
      const guildId = interaction.guild.id;
      const userId = targetMember.id;

      // Check if user has warnings
      if (!warnings[guildId] || !warnings[guildId][userId] || warnings[guildId][userId].length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('📋 User Warnings')
          .setDescription(`**${targetMember.user.tag}** has no warnings.`)
          .setColor(0x00FF00)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
      }

      const userWarnings = warnings[guildId][userId];
      
      const embed = new EmbedBuilder()
        .setTitle('⚠️ User Warnings')
        .setDescription(`**${targetMember.user.tag}** has ${userWarnings.length} warning(s):`)
        .setColor(0xFF6B6B)
        .setThumbnail(targetMember.user.displayAvatarURL())
        .setTimestamp();

      // Add warning fields (max 25 fields in embed)
      const maxWarnings = Math.min(userWarnings.length, 25);
      for (let i = 0; i < maxWarnings; i++) {
        const warning = userWarnings[i];
        const date = new Date(warning.timestamp).toLocaleDateString();
        
        embed.addFields({
          name: `Warning #${i + 1} (ID: ${warning.id})`,
          value: `**Reason:** ${warning.reason}\n**Moderator:** <@${warning.moderator}>\n**Date:** ${date}`,
          inline: false
        });
      }

      if (userWarnings.length > 25) {
        embed.setFooter({ text: `Showing 25 of ${userWarnings.length} warnings` });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(`There was an error when viewing warnings: ${error}`);
      await interaction.reply('❌ There was an error trying to view warnings.');
    }
  },
};
