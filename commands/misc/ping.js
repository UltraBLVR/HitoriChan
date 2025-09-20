module.exports = {
  name: "ping",
  category: 'misc',
  description: "Replies with Pong!",
  examples: [
    "/ping"
  ],
  callback: async (client, interaction) => {
    const startTime = Date.now();
    
    // Send initial reply
    const initialReply = await interaction.reply({ content: "🏓 Pinging...", withResponse: true });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Calculate API latency (time to send and receive response)
    const apiLatency = initialReply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `🏓 **Pong!**\n` +
      `⚡ **Response Time:** ${responseTime}ms`
    );
  },
};
