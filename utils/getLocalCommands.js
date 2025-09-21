
const path = require('path');
const getAllFiles = require('./getAllFiles');
const { get } = require('http');

module.exports = (exceptions = []) => {
  let localCommands = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, '..', 'commands'),
    true
  );

  const helpCommand = require(path.join(__dirname, '..', 'commands', 'help.js'));

  if (!exceptions.includes(helpCommand.name)) {
    localCommands.push(helpCommand);
  }

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject = require(commandFile);

      if (exceptions.includes(commandObject.name)) {
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};
