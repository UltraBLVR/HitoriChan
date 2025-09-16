const { Client, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interaction",
  description: "Make some Bocchi flavor in chat!",
  options: [
    {
      name: "shy",
      description: "Bocchi shy gif!",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "hit",
      description: "Bocchi hit gif!",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "bored",
      description: "Bocchi dance gif!",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "chill",
      description: "Bocchi chill gif!",
      type: ApplicationCommandOptionType.Subcommand,
    }
  ],

  callback: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.user; // the person who triggered the command

    // GIFs library
    const gifs = {
      shy: [
        "https://gifdb.com/images/high/bocchi-the-rock-hitori-goto-on-bathtub-jo9up1src04kdisx.gif",
        "https://media.tenor.com/s3mh97FyKoIAAAAM/bocchi-the-rock-hitori-gotoh.gif",
        "https://media.tenor.com/P7tf1_otD80AAAAM/%E5%AD%A4%E7%8D%A8%E6%90%96%E6%BB%BE-%E5%AD%A4%E7%8D%A8.gif",
      ],
      hit: [
        "https://www.icegif.com/wp-content/uploads/2023/03/icegif-1098.gif",
      ],
      bored: [
        "https://64.media.tumblr.com/1f806b967e880b66f96feed7093f7fcd/cb184b14b09c8a6e-2d/s540x810/ac3fde6a7d0e3b7ddcf46bb2b3d185d6ace39c53.gif",
        "https://images.steamusercontent.com/ugc/2027222811593440302/6046B23F9CC26E4EC352C62B4A6B59B5F80F07D5/",
      ],
      chill: [
        "https://giffiles.alphacoders.com/221/221697.gif",
      ]
    };

    // Pick a random gif
    const chosenGif = gifs[subcommand][Math.floor(Math.random() * gifs[subcommand].length)];

    // Dynamic titles
    const titles = {
      shy: `${user.username} is feeling shy...`,
      angry: `${user.username} is getting angry!!`,
      hit: `${user.username} hits the thing!!!`,
      bored: `${user.username} is full of boredom.`,
      chill: `${user.username} is chilling.`
    };

    const embed = new EmbedBuilder()
      .setTitle(titles[subcommand])
      .setDescription(`Bocchi vibes from ${user.username}`)
      .setImage(chosenGif)
      .setColor("Random") // makes it more lively
      .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() });

    interaction.reply({ embeds: [embed] });
  }
};
