const { Client, Message } = require("discord.js");
const calculateLevelXp = require("../../utils/calcLvlXp")
const coolDowns = new Set()
const Level = require("../../models/level");

function getRandXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = async (client, message) => {
  if (!message.inGuild() || message.author.bot || coolDowns.has(message.author.id)) {
    return;
  }

  const xpToGive = getRandXp(1, 25)

  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  }

  try {
    const level = await Level.findOne(query);

    if (level) {
      level.xp += xpToGive;

      if  (level.xp > calculateLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;

        message.channel.send(`${message.member} has leveled up to level ${level.level}!`);
      }
      await level.save().catch(e => {
        console.log(`Error saving updated level: ${e}`);
        return;
      });
      coolDowns.add(message.author.id);
      setTimeout(() => {
        coolDowns.delete(message.author.id);
      }, 60000)
    } else {
      const newLevel = new Level ({
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,

      });
      await newLevel.save();
      coolDowns.add(message.author.id);
      setTimeout(() => {
        coolDowns.delete(message.author.id);
      }, 5000)
    }
  } catch (error) {
    console.log(`Error giving user XP: ${error}`);
  }
}