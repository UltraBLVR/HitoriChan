const { Client, Interaction, EmbedBuilder } = require("discord.js");
const path = require("path");
const fs = require("fs");
const infoDir = path.join(__dirname, "../../config.json");
const infodata = JSON.parse(fs.readFileSync(infoDir, "utf8"));

module.exports = { 
    name: "info",
    category: 'misc',
    description: "Shows information about the bot",
    examples: ["/info"],
    
    callback: async (client, interaction) => {
        const infoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Information')
            .setDescription(
                "# MADE BY:" + "\n" + "##" + ` <@${infodata.info.devuid}>` + "\n\n" + "collaborators: " + "\n" + infodata.info.credits.map(c => `**<@${c.uid}> - ${c.role}**`)
            )
            .addFields(
                { name: 'Bot Name', value: infodata.info.botName, inline: true },
                { name: 'Version', value: infodata.info.version, inline: true },
            )
            .setFooter({ text: 'Thank you for using HitoriChan!' });

        await interaction.reply({ embeds: [infoEmbed] });
    }
}