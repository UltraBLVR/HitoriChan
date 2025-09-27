const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "8ball",
    description: "Replies magically to your input",
    examples: [
        "/8ball input:Do you like kids?"
    ],
    options: [
        {
            name:"input",
            description: "Your message where the bot answers.",
            required: true,
            type: ApplicationCommandOptionType.String,
        }
    ],
    
    callback: async (client, interaction) => {
        const input = interaction.options.get("input")?.value 
        || interaction.args?.join(" ");

        if (!input) {
            return
        }
        // Identifying the input & output
        const answer = [
            "Yes",
            "No",
            "Sure",
            "Alright",
            "Maybe",
            "Never",
            "NO??",
            "Hell no",
            "Like hell if it was a yes.",
            "Yes, smash.",
            "Mhm",
            "Perhaps",
            "I'm not sure",
            "That's doubtful enough",
            "Absolutely not",
            "Absolutely!",
            "Nuh uh",
            "Uhh... I don't know.",
            "Ask me later",
            "Your questions are pmo"
        ]
        const answerRand = Math.floor(Math.random() * answer.length)
        const response = answer[answerRand]
        const userINPUT = input;

        // preparing the 8ball Embed
        const eballEmbed = new EmbedBuilder()
        .setDescription('## 🎱 Hitori Chan - 8ball\nNote: All the answers are randomized, don\'t take it personally.')
        .addFields(
            { name: "Your input:", value: `${userINPUT}` },
            { name: "Answer:", value: `${response}` }
        )
        .setColor('#bf0fbe')

        interaction.reply( { embeds : [ eballEmbed ] } )
    }
}