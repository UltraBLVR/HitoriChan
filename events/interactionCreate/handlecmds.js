
const getLocalCommands = require('../../utils/getLocalCommands');
const handleButtons = require('./handleButtons');

module.exports = async (client, interaction) => {
  // Handle button interactions
  if (interaction.isButton()) {
    try {
      await handleButtons(client, interaction);
    } catch (error) {
      console.log(`Error handling button interaction: ${error}`);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();
  
  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: 'Not enough permissions.',
            flags: [4096],
          });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "I don't have enough permissions.",
            flags: [4096],
          });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
};
