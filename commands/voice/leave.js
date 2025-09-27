const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: "leave",
    description: "Bot leaves the voice channel",
    callback: async (client, interaction) => {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply("❌ I'm not in a voice channel!");
        }

        connection.destroy();
        interaction.reply("✅ Left the voice channel!");
    },
};
