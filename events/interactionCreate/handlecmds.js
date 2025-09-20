const getLocalCommands = require('../../utils/getLocalCommands');
const handleButtons = require('./handleButtons');
const { checkCooldown } = require('../../utils/cooldowns');

// Cache commands to avoid repeated file system access
let cachedCommands = null;
let commandsCacheTime = 0;
const COMMANDS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getCommands = () => {
  const now = Date.now();
  if (!cachedCommands || (now - commandsCacheTime) > COMMANDS_CACHE_DURATION) {
    cachedCommands = getLocalCommands();
    commandsCacheTime = now;
  }
  return cachedCommands;
};

module.exports = async (client, interaction) => {
  if (interaction.isButton()) {
    try {
      await handleButtons(client, interaction);
    } catch (error) {
      console.error(`Button interaction error: ${error}`);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const commandObject = getCommands().find(cmd => cmd.name === interaction.commandName);
  if (!commandObject) return;

  try {
    // Check cooldown (skip for help command)
    if (commandObject.name !== 'help') {
      const cooldownLeft = checkCooldown(interaction.user.id, commandObject.name, commandObject.cooldown || 3000);
      if (cooldownLeft > 0) {
        await interaction.reply({
          content: `Please wait ${cooldownLeft} seconds before using this command again.`,
          ephemeral: true
        });
        return;
      }
    }

    // Permission checks
    if (commandObject.permissionsRequired?.length) {
      const missingPerms = commandObject.permissionsRequired.filter(
        perm => !interaction.member.permissions.has(perm)
      );
      if (missingPerms.length) {
        await interaction.reply({
          content: `Missing permissions: ${missingPerms.join(', ')}`,
          ephemeral: true
        });
        return;
      }
    }

    if (commandObject.botPermissions?.length) {
      const bot = interaction.guild.members.me;
      const missingBotPerms = commandObject.botPermissions.filter(
        perm => !bot.permissions.has(perm)
      );
      if (missingBotPerms.length) {
        await interaction.reply({
          content: `I'm missing permissions: ${missingBotPerms.join(', ')}`,
          ephemeral: true
        });
        return;
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.error(`Command error [${commandObject.name}]:`, error);
    
    const errorMsg = { 
      content: 'An error occurred while executing this command.', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMsg).catch(() => {});
    } else {
      await interaction.reply(errorMsg).catch(() => {});
    }
  }
};
