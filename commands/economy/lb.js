const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Level = require("../../models/level.js");
const Balance = require("../../models/user.js"); 

module.exports = {
  name: "lb",
  description: "Shows the server leaderboard (levels, balance, etc.)",
  options: [
    {
      name: "type",
      description: "The type of leaderboard to show",
      type: ApplicationCommandOptionType.String,
      required: false,
      aliases: ["leaderboard", "top", "levels"],
      choices: [
        { name: "Levels", value: "l" },
        { name: "Starry coins", value: 'c'}
      ]
    }
  ],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const type = interaction.options?.get?.("type")?.value || "levels";

    await interaction.deferReply();

    try {
      let leaderboardData = [];

      if (type === "l") {
        const allLevels = await Level.find({ guildId: interaction.guild.id }).select("-_id userId level xp");

        if (!allLevels.length) {
          await interaction.editReply("No users have earned XP yet in this server.");
          return;
        }

        allLevels.sort((a, b) => (b.level === a.level ? b.xp - a.xp : b.level - a.level));
        const topUsers = allLevels.slice(0, 10);

        for (let i = 0; i < topUsers.length; i++) {
          const userData = topUsers[i];
          try {
            const user = await client.users.fetch(userData.userId);
            leaderboardData.push({
              tag: user.tag,
              username: user.username,
              value: `Level ${userData.level} (${userData.xp} XP)`,
              rank: i + 1
            });
          } catch {}
        }

      } else if (type === 'c') {
        const balances = await Balance.find({ guildId: interaction.guild.id }).select("-_id userId balance");

        if (!balances.length) {
          await interaction.editReply("No user balances found for this server.");
          return;
        }

        balances.sort((a, b) => b.balance - a.balance);
        const topUsers = balances.slice(0, 10);

        for (let i = 0; i < topUsers.length; i++) {
          const userData = topUsers[i];
          try {
            const user = await client.users.fetch(userData.userId);
            leaderboardData.push({
              tag: user.tag,
              username: user.username,
              value: `$${userData.balance.toLocaleString()}`,
              rank: i + 1
            });
          } catch {}
        }
      }

      if (!leaderboardData.length) {
        await interaction.editReply("Unable to fetch leaderboard data.");
        return;
      }

      // Construct the embed
      const embed = new EmbedBuilder()
        .setTitle(type === "levels" ? "🏆 Level Leaderboard" : "💰 Balance Leaderboard")
        .setDescription(`Top ${leaderboardData.length} users in **${interaction.guild.name}**`)
        .setColor(type === "levels" ? "#FFD700" : "#00FF99")
        .setTimestamp()
        .setFooter({ text: type === "levels" ? "Keep chatting to level up!" : "Earn coins to climb the ranks!" });

      // Top 3 with medals
      leaderboardData.slice(0, 3).forEach(user => {
        let medal = "";
        if (user.rank === 1) medal = "🥇";
        else if (user.rank === 2) medal = "🥈";
        else if (user.rank === 3) medal = "🥉";

        embed.addFields({
          name: `${medal} ${user.username}`,
          value: user.value,
          inline: true
        });
      });

      // Remaining users
      if (leaderboardData.length > 3) {
        const others = leaderboardData.slice(3)
          .map(user => `**${user.rank}.** ${user.username} - ${user.value}`)
          .join("\n\n");

        embed.addFields({
          name: "\u200B",
          value: others,
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(`Leaderboard Error: ${err}`);
      await interaction.editReply("Something went wrong while creating the leaderboard.");
    }
  }
};
