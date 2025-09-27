const { Client } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: "join",
    description: "Bot joins your voice channel",
    callback: async (client, interaction) => {
        const channel = interaction.member.voice.channel;
        const connection = getVoiceConnection(interaction.guild.id)
        if (!channel) {
            return interaction.reply("❌ You need to be in a voice channel first!");
        }

        if (!connection) {
            joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        })} else {
            await interaction.reply('I am already in a vc.')
        }

        

        interaction.reply(`✅ Joined **${channel.name}**!`);
    },
};
