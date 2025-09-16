const {
  Client,
  IntentsBitField,
  messageLink,
  ActivityType,
} = require("discord.js");
const { userInfo } = require("os");
const { env } = require("process");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
});

// messageCreate event is now handled by the event handler
(async () => {
  console.log("Checking environment variables...");
  console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
  console.log("TOKEN exists:", !!process.env.TOKEN);
  
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in environment variables!");
    process.exit(1);
  }
  
  // Log the connection string format (without revealing credentials)
  const uriPattern = process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log("MongoDB URI pattern:", uriPattern);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully!");
    client.login(process.env.TOKEN);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Make sure your credentials are correct and IP is whitelisted");
    process.exit(1);
  }
  eventHandler(client);
})();




