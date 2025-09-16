const { testServer } = require('../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const areCommandsDifferent = require('../../utils/areCommandsDiff');

module.exports = async (client) => {
  const localCommands = getLocalCommands();

  try {
    const applicationCommands = await getApplicationCommands(client, testServer);

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      if (!name) {
        console.log(`Skipping command without name:`, localCommand);
        continue;
      }

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );
      if (existingCommand) {
        if (areCommandsDifferent(existingCommand, localCommand)) {
          if (localCommand.deleted) {
            await applicationCommands.delete(existingCommand.id);
            console.log(`🗑 Deleted command "${localCommand.name}".`);
            continue;
          }

          // Ensure options array is properly formatted before editing
          const formattedOptions = localCommand.options?.map(option => {
            const formattedOption = { ...option };

            // Ensure choices is an array if it exists
            if (option.choices && !Array.isArray(option.choices)) {
              formattedOption.choices = [];
            }

            return formattedOption;
          }) || [];

          await applicationCommands.edit(existingCommand.id, {
            description: localCommand.description,
            options: formattedOptions,
          });

          console.log(`🔁 Edited command "${localCommand.name}".`);
        } else {
            console.log(`Command "${name}" is up to date.`);
        }
      } else {
        // Ensure options array is properly formatted before creating
        const formattedOptions = localCommand.options?.map(option => {
          const formattedOption = { ...option };

          // Ensure choices is an array if it exists
          if (option.choices && !Array.isArray(option.choices)) {
            formattedOption.choices = [];
          }

          return formattedOption;
        }) || [];

        await applicationCommands.create({
          name: localCommand.name,
          description: localCommand.description,
          options: formattedOptions,
        });

        console.log(`👑 Registered command "${localCommand.name}".`);
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};