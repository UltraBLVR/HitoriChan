
module.exports = {
  name: "help",
  description: "Shows all available commands",
  callback: async (client, interaction) => {
    const { EmbedBuilder } = require('discord.js');
    
    const helpEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('BOCCHI THE HELP!')
      .setDescription('Lost, mistyped or just want to know? Here are all the commands you can use!')
      .addFields(
        {
          name: 'ECONOMY',
          value: `
          BALANCE: shows your balance!\n
          \`\`\`/balance\`\`\` OR \`\`\`hb\`\`\`
          `
        }
      )
      .setImage('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTACJoUGD4HMA8mvTKKXjtiil19-yOoNt-RrwqoJq30IK58_2rRxi9jogrglmH7qLuwqg&usqp=CAU')
      .setFooter({ text: 'Bocchi the Helper, Hitori chan dev' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [helpEmbed] });
  },
};
