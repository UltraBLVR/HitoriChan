const User = require('../../models/user');

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  try {
    const customId = interaction.customId;

  // Handle bank confirmations
  if (customId.startsWith('bank_')) {
    if (customId === 'bank_cancel') {
      await interaction.update({
        content: '❌ Operation cancelled.',
        components: []
      });
      
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 10000);
      return;
    }

    if (customId.startsWith('bank_deposit_confirm_')) {
      const amount = parseInt(customId.split('_')[3]);

      // Get the user who clicked the button (works for both guild and DM interactions)
      const userId = interaction.member ? interaction.member.id : interaction.user.id;
      const guildId = interaction.guild ? interaction.guild.id : 'dm';

      // Get user document
      let userDoc = await User.findOne({ 
        userId: userId, 
        guildId: guildId 
      });

      if (!userDoc || userDoc.balance < amount) {
        await interaction.update({
          content: '❌ Insufficient funds for this deposit!',
          components: []
        });
        
        setTimeout(() => {
          interaction.deleteReply().catch(() => {});
        }, 10000);
        return;
      }

      userDoc.balance -= amount;
      userDoc.bank += amount;
      await userDoc.save();

      await interaction.update({
        content: `🏦 ✅ **Deposit Successful!**\n` +
        `Deposited **${amount}** coins to your bank.\n\n` +
        `💰 New Wallet Balance: **${userDoc.balance}** coins\n` +
        `🏛️ New Bank Balance: **${userDoc.bank}** coins`,
        components: []
      });
      
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 10000);
    }

    if (customId.startsWith('bank_withdraw_confirm_')) {
      const amount = parseInt(customId.split('_')[3]);

      // Get the user who clicked the button (works for both guild and DM interactions)
      const userId = interaction.member ? interaction.member.id : interaction.user.id;
      const guildId = interaction.guild ? interaction.guild.id : 'dm';

      // Get user document
      let userDoc = await User.findOne({ 
        userId: userId, 
        guildId: guildId 
      });

      if (!userDoc || userDoc.bank < amount) {
        await interaction.update({
          content: '❌ Insufficient funds in bank for this withdrawal!',
          components: []
        });
        
        setTimeout(() => {
          interaction.deleteReply().catch(() => {});
        }, 10000);
        return;
      }

      userDoc.bank -= amount;
      userDoc.balance += amount;
      await userDoc.save();

      await interaction.update({
        content: `🏦 ✅ **Withdrawal Successful!**\n` +
        `Withdrew **${amount}** coins from your bank.\n\n` +
        `💰 New Wallet Balance: **${userDoc.balance}** coins\n` +
        `🏛️ New Bank Balance: **${userDoc.bank}** coins`,
        components: []
      });
      
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 10000);
    }
  }
  } catch (error) {
    console.log(`Error in button handler: ${error}`);

    // Try to respond if the interaction hasn't been replied to yet
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: '❌ An error occurred while processing your request.',
          flags: [4096]
        });
      } catch (replyError) {
        console.log(`Could not send error reply: ${replyError}`);
      }
    }
  }
};