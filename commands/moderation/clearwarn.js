
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
  name: "clearwarn",
  description: "Clear warnings from a user",
  options: [
    {
      name: "user",
      description: "The user to clear warnings from",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "warning-id",
      description: "Specific warning ID to remove (leave empty to clear all)",
      required: false,
      type: ApplicationCommandOptionType.String
    }
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    const targetUser = interaction.options.get('user')?.value;
    const warningId = interaction.options.get('warning-id')?.value;

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
        await interaction.reply(`❌ **${targetMember.user.tag}** has no warnings to clear.`);
        return;
      }

      if (warningId) {
        // Remove specific warning
        const warningIndex = warnings[guildId][userId].findIndex(w => w.id === warningId);
        
        if (warningIndex === -1) {
          await interaction.reply(`❌ Warning with ID \`${warningId}\` not found for **${targetMember.user.tag}**.`);
          return;
        }

        warnings[guildId][userId].splice(warningIndex, 1);
        
        // If no warnings left, remove user entry
        if (warnings[guildId][userId].length === 0) {
          delete warnings[guildId][userId];
        }

        writeWarnings(warnings);
        await interaction.reply(`✅ Removed warning \`${warningId}\` from **${targetMember.user.tag}**.`);
      } else {
        // Clear all warnings
        const warningCount = warnings[guildId][userId].length;
        delete warnings[guildId][userId];
        
        writeWarnings(warnings);
        await interaction.reply(`✅ Cleared all ${warningCount} warning(s) from **${targetMember.user.tag}**.`);
      }
    } catch (error) {
      console.log(`There was an error when clearing warnings: ${error}`);
      await interaction.reply('❌ There was an error trying to clear warnings.');
    }
  },
};
