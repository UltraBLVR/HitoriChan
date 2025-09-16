
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
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

// Helper function to write warnings
function writeWarnings(warnings) {
  try {
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
  } catch (error) {
    console.log('Error writing warnings file:', error);
  }
}

module.exports = {
  name: "warn",
  description: "Warn a user",
  options: [
    {
      name: "user",
      description: "The user to warn",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "reason",
      description: "Reason for warning",
      required: false,
      type: ApplicationCommandOptionType.String
    }
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    const targetUser = interaction.options.get('user')?.value;
    const reason = interaction.options.get('reason')?.value || 'No reason provided';

    if (!targetUser) {
      await interaction.reply('❌ Please specify a user to warn.');
      return;
    }

    const targetMember = await interaction.guild.members.fetch(targetUser).catch(() => null);
    
    if (!targetMember) {
      await interaction.reply('❌ User not found in this server.');
      return;
    }

    if (targetMember.user.bot) {
      await interaction.reply('❌ Cannot warn bots.');
      return;
    }

    if (targetMember.id === interaction.user.id) {
      await interaction.reply('❌ You cannot warn yourself.');
      return;
    }

    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      await interaction.reply('❌ You cannot warn someone with equal or higher role than you.');
      return;
    }

    try {
      // Read current warnings
      const warnings = readWarnings();
      const guildId = interaction.guild.id;
      const userId = targetMember.id;

      // Initialize guild warnings if not exists
      if (!warnings[guildId]) {
        warnings[guildId] = {};
      }

      // Initialize user warnings if not exists
      if (!warnings[guildId][userId]) {
        warnings[guildId][userId] = [];
      }

      // Add new warning
      const warning = {
        id: Date.now().toString(),
        reason: reason,
        moderator: interaction.user.id,
        moderatorTag: interaction.user.tag,
        timestamp: new Date().toISOString()
      };

      const warningCount = warnings[guildId][userId].length;
      warnings[guildId][userId].push(warning);

      writeWarnings(warnings);

      await targetMember.send(`⚠️ You have been warned in **${interaction.guild.name}**\nReason: ${reason}\nWarning ID: ${warning.id}`).catch(() => {
      });

      if (interaction.user.id === '955317082432610425') {
        await interaction.reply(`<:wonderhoy:1405731688478150696> **${targetMember.user.tag}** has been ~~warned~~ wonderhoyed!\nReason: ${reason}\nTotal warnings: ${warningCount}`);
      } else {
        await interaction.reply(`⚠️ **${targetMember.user.tag}** has been warned.\nReason: ${reason}\nTotal warnings: ${warningCount}`);
      }
    } catch (error) {
      console.log(`There was an error when warning: ${error}`);
      await interaction.reply('❌ There was an error trying to warn this user.');
    }
  },
};
