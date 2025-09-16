
const { Client, Interaction, ApplicationCommandOptionType } = require("discord.js");
const User = require("../../models/user");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = {
  callback: async (client, interaction) => {
    if (!interaction.guild) {
      await interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true
      });
      return;
    }

    const targetUserId = interaction.options?.get?.("user")?.value;
    const amountInput = interaction.options?.get?.("amount")?.value;

    await interaction.deferReply();

    if (!targetUserId || !amountInput) {
      await interaction.reply({
        content: "❌ Missing required arguments. Usage: ```pay <user> <amount>```",
      });
      return;
    }
  
    // Check if trying to pay themselves
    if (targetUserId === interaction.member.id) {
      await interaction.editReply("You can't pay yourself!");
      return;
    }

    // Get sender's balance first to calculate percentages/all
    const senderDoc = await User.findOne({ 
      userId: interaction.member.id, 
      guildId: interaction.guild.id 
    });

    if (!senderDoc) {
      await interaction.editReply("You don't have any money to pay!");
      return;
    }

    // Parse amount (support "all", percentages, and integers)
    let amount;
    if (typeof amountInput === 'string') {
      if (amountInput.toLowerCase() === 'all') {
        amount = senderDoc.balance;
      } else if (amountInput.includes('%')) {
        const percentage = parseFloat(amountInput.replace('%', ''));
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
          await interaction.editReply("❌ Invalid percentage! Use a number between 1-100.");
          return;
        }
        amount = Math.floor((senderDoc.balance * percentage) / 100);
      } else {
        amount = parseInt(amountInput);
      }
    } else {
      amount = amountInput;
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      await interaction.editReply("You must pay a positive amount!");
      return;
    }

    // Check if sender has enough balance
    if (senderDoc.balance < amount) {
      await interaction.editReply("You don't have enough money to make this payment!");
      return;
    }

    // Get or create recipient document
    let recipientDoc = await User.findOne({ 
      userId: targetUserId, 
      guildId: interaction.guild.id 
    });

    if (!recipientDoc) {
      recipientDoc = new User({
        userId: targetUserId,
        guildId: interaction.guild.id,
        balance: 0,
        lastDaily: new Date()
      });
    }

    // Perform the transaction
    senderDoc.balance -= amount;
    recipientDoc.balance += amount;

    await senderDoc.save();
    await recipientDoc.save();

    await interaction.editReply(
      `💸 You paid **${amount}** coins to <@${targetUserId}>!\n` +
      `Your new balance: **${senderDoc.balance}** coins`
    );
  },

  name: "pay",
  description: "Send money to another user",
  options: [
    {
      name: "user",
      description: "The user to pay",
      required: true,
      type: ApplicationCommandOptionType.User
    },
    {
      name: "amount",
      description: "Amount to send (supports 'all', percentages like '50%', or specific numbers)",
      required: true,
      type: ApplicationCommandOptionType.String
    }
  ]
};
