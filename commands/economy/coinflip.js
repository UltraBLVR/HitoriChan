
const { Client, Interaction, ApplicationCommandOptionType } = require("discord.js");
const User = require("../../models/user");
const EmojiHandler = require("../../utils/emojiHandler");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = {
  callback: async (client, interaction, args) => {
    // Check if it's a message (prefix command) or interaction (slash command)
    const isSlashCommand = !!interaction.options;
    const guild = interaction.guild;
    const member = interaction.member || interaction.author;
    const memberId = member.id || member.user?.id;

    if (!guild) {
      const content = "You can only run this command inside a server.";
      if (isSlashCommand) {
        await interaction.reply({ content, ephemeral: true });
      } else {
        await interaction.reply(content);
      }
      return;
    }

    let choice, amountInput;

    if (isSlashCommand) {
      // Slash command logic
      const choiceOption = interaction.options.get("choice");
      const amountOption = interaction.options.get("amount");

      if (!choiceOption) {
        await interaction.reply({
          content: "❌ Please specify a valid choice (heads/h or tails/t)!",
          ephemeral: true
        });
        return;
      }

      if (!amountOption) {
        await interaction.reply({
          content: "❌ Please specify an amount to bet!",
          ephemeral: true
        });
        return;
      }

      choice = choiceOption.value;
      amountInput = amountOption.value;
      
      await interaction.deferReply();
    } else {
      // Prefix command logic
      if (!args || args.length < 2) {
        await interaction.reply("❌ Usage: `h.coinflip <heads/tails> <amount>`");
        return;
      }

      const choiceArg = args[0].toLowerCase();
      if (!['heads', 'h', 'tails', 't'].includes(choiceArg)) {
        await interaction.reply("❌ Please specify a valid choice (heads/h or tails/t)!");
        return;
      }

      choice = choiceArg === 'h' ? 'heads' : choiceArg === 't' ? 'tails' : choiceArg;
      amountInput = args[1];
    }

    // Get user's balance
    let userProfile = await User.findOne({
      userId: memberId,
      guildId: guild.id,
    });

    if (!userProfile) {
      userProfile = new User({
        userId: memberId,
        guildId: guild.id,
        balance: 0,
        lastDaily: new Date()
      });
    }

    let amount;
    if (typeof amountInput === 'string') {
      if (amountInput.toLowerCase() === 'all') {
        amount = userProfile.balance;
      } else if (amountInput.includes('%')) {
        const percentage = parseFloat(amountInput.replace('%', ''));
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
          await interaction.editReply("❌ Invalid percentage! Use a number between 1-100.");
          return;
        }
        amount = Math.floor((userProfile.balance * percentage) / 100);
      } else {
        amount = parseInt(amountInput);
      }
    } else {
      amount = amountInput;
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      const content = "❌ Please enter a valid amount!";
      if (isSlashCommand) {
        await interaction.editReply(content);
      } else {
        await interaction.reply(content);
      }
      return;
    }

    if (amount < 100) {
      const content = "❌ You must bet at least 100 coins!";
      if (isSlashCommand) {
        await interaction.editReply(content);
      } else {
        await interaction.reply(content);
      }
      return;
    }

    if (amount > userProfile.balance) {
      const content = `❌ You don't have enough coins! Your balance: **${userProfile.balance}** coins`;
      if (isSlashCommand) {
        await interaction.editReply(content);
      } else {
        await interaction.reply(content);
      }
      return;
    }

    // Coinflip logic
    const outcomes = ['heads', 'tails'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    const isWin = choice === result;

    const emojiHandler = new EmojiHandler(client);

    // Check for booster role
    const boosterRoleId = '1381497449147007076';
    const hasBoosterRole = interaction.member.roles.cache.has(boosterRoleId);
    const boosterMultiplier = hasBoosterRole ? 2.0 : 1.50;

    if (isWin) {
      const winAmount = Math.floor(amount * boosterMultiplier);
      userProfile.balance += winAmount;
      await userProfile.save();

      const boosterText = hasBoosterRole ? " *(Booster bonus applied!)*" : "";
      const winContent = 
        `🪙 **Coinflip Result: ${result.toUpperCase()}** 🪙\n\n` +
        `🎉 **You won!** You chose **${choice}** and it landed on **${result}**!\n\n` +
        `💰 **+${winAmount}** coins${boosterText}\n` +
        `💵 **New balance:** ${userProfile.balance} coins`;

      let winMessage;
      if (isSlashCommand) {
        winMessage = await interaction.editReply(winContent);
      } else {
        winMessage = await interaction.reply(winContent);
      }

      // React with celebration emojis
      await emojiHandler.reactWithEmoji(winMessage, "🎉", guild.id);
      await emojiHandler.reactWithEmoji(winMessage, "💰", guild.id);
    } else {
      userProfile.balance -= amount;
      await userProfile.save();

      const loseContent = 
        `🪙 **Coinflip Result: ${result.toUpperCase()}** 🪙\n\n` +
        `😔 **You lost!** You chose **${choice}** but it landed on **${result}**.\n\n` +
        `💸 **-${amount}** coins\n` +
        `💵 **New balance:** ${userProfile.balance} coins`;

      let loseMessage;
      if (isSlashCommand) {
        loseMessage = await interaction.editReply(loseContent);
      } else {
        loseMessage = await interaction.reply(loseContent);
      }

      // React with sad emojis
      await emojiHandler.reactWithEmoji(loseMessage, "💸", guild.id);
      await emojiHandler.reactWithEmoji(loseMessage, "😢", guild.id);
    }
  },

  name: "coinflip",
  description: "Flip a coin and gamble your coins",
  options: [
    {
      name: "choice",
      description: "Choose heads or tails",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Heads",
          value: "heads"
        },
        {
          name: "Tails",
          value: "tails"
        }
      ]
    },
    {
      name: "amount",
      description: "Amount to bet (supports 'all', percentages like '50%', or specific numbers)",
      required: true,
      type: ApplicationCommandOptionType.String
    }
  ]
};
