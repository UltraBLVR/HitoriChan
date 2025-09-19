const { time } = require('console');
const { Schema, model } = require('mongoose');

const messageHistorySchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    messages: {
        type: Array,
        default: [],
    },
}, { timestamps: true });

module.exports = model('AiMsgHistory', messageHistorySchema);