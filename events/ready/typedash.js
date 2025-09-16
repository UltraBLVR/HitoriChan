const User = require('../../models/user');

const words = [
    "hitori gotoh", "guitar", "rock", "nijika", "ikuyo kita",
    "hatsune miku", "kasane teto", "ryo yamada",
    "social axiety", "i hate job", "sata andagi"
];

let messageCounter = 0;
let messageThreshold = getRandomThreshold(); // random 50–100
let isRoundActive = false; // 🔒 lock

function getRandomThreshold() {
    return Math.floor(Math.random() * (100 - 10 + 1)) + 10; // 50–100
}

async function startRound(channel) {
    isRoundActive = true; // lock so new games don't trigger

    const randomWord = words[Math.floor(Math.random() * words.length)];
    await channel.send(`⚡ First person to type **${randomWord}** wins a reward!`);
    console.log(`Sent word: ${randomWord}`);

    const filter = msg => msg.content.toLowerCase() === randomWord.toLowerCase() && !msg.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async msg => {
        console.log(`${msg.author.tag} typed the word!`);

        let userDoc = await User.findOne({ userId: msg.author.id, guildId: msg.guild.id });
        if (!userDoc) {
            userDoc = new User({
                userId: msg.author.id,
                guildId: msg.guild.id,
                balance: 0,
                bank: 0,
                lastDaily: new Date(),
            });
        }

        const reward = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
        userDoc.balance += reward;
        await userDoc.save();

        msg.reply(`🎉 Congrats ${msg.author}, you earned **${reward}** coins!`);
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            channel.send(`⌛ Time's up! No one typed the word **${randomWord}**.`);
        }

        // reset for next round
        messageCounter = 0;
        messageThreshold = getRandomThreshold();
        isRoundActive = false; // unlock ✅

        console.log(`🔄 Next game will trigger after ${messageThreshold} messages.`);
    });
}

module.exports = async (client) => {
    console.log("✅ TypeDash minigame started!");

    const channelId = '1376280104153514164';
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        console.log("❌ Could not fetch channel.");
        return;
    }

    client.on('messageCreate', async (msg) => {
        if (msg.channel.id !== channelId || msg.author.bot) return;

        if (isRoundActive) return; // 🚫 ignore while game is running

        messageCounter++;
        if (messageCounter >= messageThreshold) {
            console.log(`🚀 Triggering game after ${messageCounter} messages.`);
            startRound(channel);
        }
    });
};
