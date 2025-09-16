
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rules',
  description: 'Display the server rules!',
  
  callback: async (client, interaction) => {
    const isSlashCommand = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const rulesEmbedImg = new EmbedBuilder()
      .setImage('https://cdn.discordapp.com/attachments/1386443575469805568/1405325626369507492/BOCCHIE_SERVER_RULES__20250612_122938_0000.png?ex=689e6afb&is=689d197b&hm=bbaa00167680d96f7648290b91f4f5d35880a9e229d530dd4cecf926585989ad&')
    .setColor('#FF69B4')
    
    const rulesEmbed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setDescription('# 🎸 Bocchi the Rules!\nWelcome to our **Bocchi the Rock!** server — a place to be awkward, rock out, and hang with fellow fans! Please read the rules to keep everything fun and cozy.')
      .addFields(
        {
          name: '1. Be Kind, Not Cringe',
          value: 'No bullying, slurs, or hate. Treat others like me — gently',
          inline: true,
        },
        {
          name: '2. No Spammy Behavior',
          value: 'Avoid spamming text, emojis, or links. Don\'t stage dive on the chat.',
          inline: true,
        },
        {
          name: '3. SFW Only',
          value: 'No NSFW images, jokes, or links. I might explode',
          inline: true,
        },
        {
          name: '4. Respect the Channels',
          value: 'Post in the right places. Don\'t drop memes in music discussions for no reason.',
          inline: true,
        },
        {
          name: '5. No Unapproved Self-Promo',
          value: 'No ads or promos unless if you need a partnership.',
          inline: true,
        },
        {
          name: '6. Follow Discord\'s Rules',
          value: '[TOS](https://discord.com/terms) & [Guidelines](https://discord.com/guidelines) apply.',
          inline: true,
        },
        {
          name: '7. Mods Are Your Nijika',
          value: 'Respect the mods. They\'re here to keep me from melting down.',
          inline: true,
        },
        {
          name: '8. No Drama, Just Jams',
          value: 'Keep fights out of public channels. Take it to DMs if needed.',
          inline: true,
        },
        {
          name: '9. English Only (Mostly)',
          value: 'Unless in a language-specific channel, stick to English.',
          inline: true,
        },
        {
          name: '10. Have Fun, Stay Awkward 🤘',
          value: 'This is a place to enjoy *Bocchi the Rock!*, music, and the awkward vibes. see ya later!',
          inline: false,
        },
      )
      .setFooter({
        text: 'Rock on, Kessoku Band-style!',
        iconURL: client.user.displayAvatarURL(),
      });

    if (isSlashCommand) {
      await interaction.channel.send({ embeds: [rulesEmbedImg, rulesEmbed] });
    } else {
      // For prefix commands (message-based)
      await interaction.channel.send({ embeds: [rulesEmbedImg, rulesEmbed] });
    }
  },
};
