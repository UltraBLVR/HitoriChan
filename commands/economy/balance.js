
const { Client, Interaction, ApplicationCommandOptionType } = require("discord.js");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

const User = require("../../models/user");
module.exports = {
  callback: async (client, interaction) => {
    if (!interaction.guild) {
      await interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true
      });
      return;
    }

    const targetUserId = interaction.options.get("user")?.value || interaction.member.id;

    await interaction.deferReply();

    const userDoc = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });

    if (!userDoc) {
      await interaction.editReply(`That user doesn't exist.`);
      return;
    }

    // Initialize bank field if it doesn't exist
    if (userDoc.bank === undefined) {
      userDoc.bank = 0;
    }

    const walletAmount = userDoc.balance;
    const bankAmount = userDoc.bank;
    const totalAmount = walletAmount + bankAmount;

    await interaction.editReply(
      `${targetUserId === interaction.member.id ? 
        `💰 **Your Balance**\n` +
        `💵 Wallet: ${walletAmount} coins\n` +
        `🏛️ Bank: ${bankAmount} coins\n` +
        `💎 Total: ${totalAmount} coins` :
        `💰 **<@${targetUserId}>'s Balance**\n` +
        `💵 Wallet: ${walletAmount} coins\n` +
        `🏛️ Bank: ${bankAmount} coins\n` +
        `💎 Total: ${totalAmount} coins`
      }`
    );
  },
  
  name: "balance",
  description: "Shows your balance",
  options: [
    {
      name: "user",
      description: "The user to check the balance of",
      required: false,
      type: ApplicationCommandOptionType.Mentionable
    }
  ]
}
