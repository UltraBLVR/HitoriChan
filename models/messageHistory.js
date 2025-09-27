const { Schema, model } = require("mongoose");

const messageHistorySchema = new Schema(
  {
    userId: { type: String, required: true },   // who is chatting
    guildId: { type: String, required: true },  // where they chatted
    channelId: { type: String, required: true },// which channel
    messages: {
      type: [
        {
          role: { type: String, enum: ["user", "assistant"], required: true },
          content: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model("messageHistory", messageHistorySchema);
