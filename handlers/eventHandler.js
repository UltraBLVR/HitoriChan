const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const { handleEventError } = require("../utils/errorHandler");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a.localeCompare(b));
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    client.on(eventName, async (...args) => {
      const promises = eventFiles.map(async (eventFile) => {
        try {
          const eventFunction = require(eventFile);
          await eventFunction(client, ...args);
        } catch (error) {
          handleEventError(error, `${eventName}:${path.basename(eventFile)}`);
        }
      });
      
      // Execute all event handlers concurrently for better performance
      await Promise.allSettled(promises);
    });
  }
};