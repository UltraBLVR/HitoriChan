module.exports = {
  handleCommandError: async (error, interaction, commandName) => {
    console.error(`Command error [${commandName}]:`, error);
    
    const errorMsg = { 
      content: 'An error occurred while executing this command.', 
      ephemeral: true 
    };
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMsg);
      } else {
        await interaction.reply(errorMsg);
      }
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
  },

  handleEventError: (error, eventName) => {
    console.error(`Event error [${eventName}]:`, error);
  }
};