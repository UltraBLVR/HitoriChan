const { Client, Interaction, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const User = require("../../models/user");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = {
  callback: async (client, interaction) => {

    const action = interaction.options.get("action").value;
    const amountInput = interaction.options.get("amount")?.value; // Renamed to amountInput to avoid conflict

    // Get or create user document
    const userId = interaction.member ? interaction.member.id : interaction.user.id;
    const guildId = interaction.guild ? interaction.guild.id : 'dm';

    let userDoc = await User.findOne({
      userId: userId,
      guildId: guildId
    });

    if (!userDoc) {
      userDoc = new User({
        userId: userId,
        guildId: guildId,
        balance: 0,
        bank: 0,
        lastDaily: new Date()
      });
    }

    // Initialize bank field if it doesn't exist
    if (userDoc.bank === undefined) {
      userDoc.bank = 0;
    }

    let reply;

    switch (action) {
      case "balance":
        reply = await interaction.reply({
          content: `🏦 **Bank Account**\n` +
          `🏛️ Bank: **${userDoc.bank}** coins`,
        });

        setTimeout(() => {
          reply.delete().catch(() => {});
        }, 10000);
        break;

      case "deposit":
        if (!amountInput) {
          reply = await interaction.reply({ content: "Please specify an amount to deposit!" });
          setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
          return;
        }

        // Parse amount (support "all", percentages, and integers)
        let depositAmount;
        if (typeof amountInput === 'string') {
          if (amountInput.toLowerCase() === 'all') {
            depositAmount = userDoc.balance;
          } else if (amountInput.includes('%')) {
            const percentage = parseFloat(amountInput.replace('%', ''));
            if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
              reply = await interaction.reply({ content: "❌ Invalid percentage! Use a number between 1-100." });
              setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
              return;
            }
            depositAmount = Math.floor((userDoc.balance * percentage) / 100);
          } else {
            depositAmount = parseInt(amountInput);
          }
        } else {
          depositAmount = amountInput;
        }

        if (isNaN(depositAmount) || depositAmount <= 0) {
          reply = await interaction.reply({ content: "Please specify a valid amount to deposit!" });
          setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
          return;
        }

        if (userDoc.balance < depositAmount) {
          reply = await interaction.reply({ content: "You don't have enough money in your wallet to deposit that amount!" });
          setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
          return;
        }

        userDoc.balance -= depositAmount;
        userDoc.bank += depositAmount;
        await userDoc.save();

        reply = await interaction.reply({ content: `You deposited ${depositAmount} coins into your bank!` });
        setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
        break;

      case "withdraw":
        if (!amountInput) {
          reply = await interaction.reply({ content: "Please specify an amount to withdraw!" });
          setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
          return;
        }

        // Parse amount (support "all", percentages, and integers)
        let withdrawAmount;
        if (typeof amountInput === 'string') {
          if (amountInput.toLowerCase() === 'all') {
            withdrawAmount = userDoc.bank;
          } else if (amountInput.includes('%')) {
            const percentage = parseFloat(amountInput.replace('%', ''));
            if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
              reply = await interaction.reply({ content: "❌ Invalid percentage! Use a number between 1-100." });
              setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
              return;
            }
            withdrawAmount = Math.floor((userDoc.bank * percentage) / 100);
          } else {
            withdrawAmount = parseInt(amountInput);
          }
        } else {
          withdrawAmount = amountInput;
        }

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
          reply = await interaction.reply({ content: "Please specify a valid amount to withdraw!" });
          setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
          return;
        }

        if (userDoc.bank < withdrawAmount) {
          reply = await interaction.reply({ content: "You don't have enough money in your bank to withdraw that amount!" });
          setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
          return;
        }

        userDoc.balance += withdrawAmount;
        userDoc.bank -= withdrawAmount;
        await userDoc.save();

        reply = await interaction.reply({ content: `You withdrew ${withdrawAmount} coins from your bank!` });
        setTimeout(() => { reply.delete().catch(() => {}); }, 10000);
        break;
    }
  },

  name: "bank",
  description: "Manage your bank account",
  ephermal: true,
  options: [
    {
      name: "action",
      description: "What do you want to do?",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Check Balance",
          value: "balance"
        },
        {
          name: "Deposit Money",
          value: "deposit"
        },
        {
          name: "Withdraw Money",
          value: "withdraw"
        }
      ]
    },
    {
      name: "amount",
      description: "Amount to deposit or withdraw (e.g., 100, 50%, all)",
      required: false,
      type: ApplicationCommandOptionType.String, // Changed to String to support text inputs like 'all' and '%'
    }
  ]
};