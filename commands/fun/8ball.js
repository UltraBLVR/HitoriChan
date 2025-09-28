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
            "Yes",                          //1
            "Yeah",
            "Ye",                           //3
            "Absolutely!",
            "Of course!",                   //5
            "Hell yeah!",
            "My sources say yes.",          //7
            "Most likely yes",

            "Maybe",                        //1
            "Perhaps",
            "I don't think so.",            //3
            "I don't know.",
            "Ask me later",                 //5
            "Very doubtful...",
            "Hmm...",                       //7
            "Uhh...",
            
            "No.",                          //1
            "Nah",
            "Nope",                         //3
            "Absolutely not.",
            "Never",                        //5
            "Hell no.",
            "My sources say no.",           //7
            "Hell if it was a yes.",
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
        .setColor('#ff83e4')

        interaction.reply( { embeds : [ eballEmbed ] } )
    }
}