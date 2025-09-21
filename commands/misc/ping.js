const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ping",
  category: 'misc',
  description: "Replies with Pong!",
  examples: ["/ping"],
  
  callback: async (client, interaction) => {
    const initialReply = await interaction.reply({ content: "Pinging...", fetchReply: true });

    const responseTime = initialReply.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const pingEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Response Time', value: `${responseTime}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
      );

    await interaction.editReply({ embeds: [pingEmbed], content: "" });
  },
};
