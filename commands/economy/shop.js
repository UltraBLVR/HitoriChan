
const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const User = require("../../models/user");
const shopConfig = require("../../config/shop.json");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */

module.exports = {
  callback: async (client, interaction) => {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true
      });
      return;
    }

    let action = interaction.options.get("action")?.value;
    const itemId = interaction.options.get("item")?.value;
    
    if (action !== "list" && action !== "buy") {
      action = "list";
    }
    
    if (action === "list") {
      const embed = new EmbedBuilder()
        .setTitle("🛒 Server Shop")
        .setColor(0x00AE86)
        .setDescription("Use `/shop buy <item>` to purchase items!")
        .setTimestamp();

      // Add roles section
      if (shopConfig.roles.length > 0) {
        let rolesText = "";
        shopConfig.roles.forEach(role => {
          rolesText += `${role.emoji} **${role.name}** - ${role.price} coins\n${role.description}\n\n`;
        });
        embed.addFields({ name: "🎭 Roles", value: rolesText, inline: false });
      }

      // Add crates section (for future use)
      if (shopConfig.crates.length > 0) {
        let cratesText = "";
        shopConfig.crates.forEach(crate => {
          cratesText += `${crate.emoji} **${crate.name}** - ${crate.price} coins\n${crate.description}\n\n`;
        });
        embed.addFields({ name: "📦 Crates", value: cratesText, inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (action === "buy") {
      if (!itemId) {
        await interaction.editReply("Please specify an item to buy! Use `/shop list` to see available items.");
        return;
      }

      let item = shopConfig.roles.find(role => role.id === itemId);
      let itemType = "role";

      if (!item) {
        item = shopConfig.crates.find(crate => crate.id === itemId);
        itemType = "crate";
      }

      if (!item) {
        await interaction.editReply("Item not found! Use `/shop list` to see available items.");
        return;
      }

      let userDoc = await User.findOne({ 
        userId: interaction.member.id, 
        guildId: interaction.guild.id 
      });

      if (!userDoc || userDoc.balance < item.price) {
        await interaction.editReply(
          `❌ You don't have enough coins to buy **${item.name}**!\n` +
          `💰 Required: ${item.price} coins\n` +
          `💰 Your balance: ${userDoc ? userDoc.balance : 0} coins`
        );
        return;
      }

      if (itemType === "role") {
        // Check if user already has the role
        if (interaction.member.roles.cache.has(item.roleId)) {
          await interaction.editReply(`❌ You already have the **${item.name}** role!`);
          return;
        }

        // Check if role exists
        const role = interaction.guild.roles.cache.get(item.roleId);
        if (!role) {
          await interaction.editReply("❌ This role is currently unavailable. Please contact an administrator.");
          return;
        }

        try {
          // Add role to user
          await interaction.member.roles.add(role);
          
          // Deduct coins
          userDoc.balance -= item.price;
          await userDoc.save();

          await interaction.editReply(
            `✅ Successfully purchased **${item.name}**!\n` +
            `💰 Spent: ${item.price} coins\n` +
            `💰 Remaining balance: ${userDoc.balance} coins`
          )

          if (item.roleId === "1405666373329223720") {
            await interaction.channel.send(`Create a ticket to continue creating your custom role!`);
            await interaction.channel.send('1386443575469805568', `test`)
          };
          
        } catch (error) {
          console.log(`Error adding role: ${error}`);
          await interaction.editReply("❌ Failed to add role. Please contact an administrator.");
        }
      }
    }
  },

  name: "shop",
  description: "Browse and buy items from the server shop",
  options: [
    {
      name: "action",
      description: "What do you want to do?",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "List",
          value: "list"
        },
        {
          name: "Buy",
          value: "buy"
        }
      ]
    },
    {
      name: "item",
      description: "Item ID to purchase (use list first to see IDs)",
      required: false,
      type: ApplicationCommandOptionType.String
    }
  ]
};
