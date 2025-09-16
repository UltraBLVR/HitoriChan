
const { EmojiResolvable } = require('discord.js');

class EmojiHandler {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get emoji string that works for both animated and static emojis
   * @param {string} emojiIdentifier - Emoji name, ID, or unicode
   * @param {string} guildId - Optional guild ID to search in specific guild
   * @returns {string} Formatted emoji string
   */
  getEmoji(emojiIdentifier, guildId = null) {
    // If it's already a unicode emoji, return as is
    if (this.isUnicodeEmoji(emojiIdentifier)) {
      return emojiIdentifier;
    }

    // Try to find custom emoji
    let emoji = null;

    if (guildId) {
      // Search in specific guild
      const guild = this.client.guilds.cache.get(guildId);
      if (guild) {
        emoji = guild.emojis.cache.find(e => 
          e.name === emojiIdentifier || 
          e.id === emojiIdentifier
        );
      }
    } else {
      // Search in all guilds
      emoji = this.client.emojis.cache.find(e => 
        e.name === emojiIdentifier || 
        e.id === emojiIdentifier
      );
    }

    if (emoji) {
      // Format based on whether it's animated or not
      return emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
    }

    // Fallback: return the identifier as is
    return emojiIdentifier;
  }

  /**
   * Get multiple emojis at once
   * @param {string[]} emojiIdentifiers - Array of emoji identifiers
   * @param {string} guildId - Optional guild ID
   * @returns {string[]} Array of formatted emoji strings
   */
  getEmojis(emojiIdentifiers, guildId = null) {
    return emojiIdentifiers.map(identifier => this.getEmoji(identifier, guildId));
  }

  /**
   * Check if string is a unicode emoji
   * @param {string} str - String to check
   * @returns {boolean}
   */
  isUnicodeEmoji(str) {
    const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/;
    return emojiRegex.test(str);
  }

  /**
   * Get emoji information
   * @param {string} emojiIdentifier - Emoji identifier
   * @param {string} guildId - Optional guild ID
   * @returns {Object|null} Emoji information object
   */
  getEmojiInfo(emojiIdentifier, guildId = null) {
    if (this.isUnicodeEmoji(emojiIdentifier)) {
      return {
        name: emojiIdentifier,
        id: null,
        animated: false,
        unicode: true,
        formatted: emojiIdentifier
      };
    }

    let emoji = null;

    if (guildId) {
      const guild = this.client.guilds.cache.get(guildId);
      if (guild) {
        emoji = guild.emojis.cache.find(e => 
          e.name === emojiIdentifier || 
          e.id === emojiIdentifier
        );
      }
    } else {
      emoji = this.client.emojis.cache.find(e => 
        e.name === emojiIdentifier || 
        e.id === emojiIdentifier
      );
    }

    if (emoji) {
      return {
        name: emoji.name,
        id: emoji.id,
        animated: emoji.animated,
        unicode: false,
        formatted: emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`,
        url: emoji.url
      };
    }

    return null;
  }

  /**
   * React to a message with an emoji
   * @param {Message} message - Discord message object
   * @param {string} emojiIdentifier - Emoji identifier
   * @param {string} guildId - Optional guild ID
   * @returns {Promise}
   */
  async reactWithEmoji(message, emojiIdentifier, guildId = null) {
    try {
      if (this.isUnicodeEmoji(emojiIdentifier)) {
        return await message.react(emojiIdentifier);
      }

      let emoji = null;

      if (guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (guild) {
          emoji = guild.emojis.cache.find(e => 
            e.name === emojiIdentifier || 
            e.id === emojiIdentifier
          );
        }
      } else {
        emoji = this.client.emojis.cache.find(e => 
          e.name === emojiIdentifier || 
          e.id === emojiIdentifier
        );
      }

      if (emoji) {
        return await message.react(emoji);
      }

      // Fallback: try to react with the identifier directly
      return await message.react(emojiIdentifier);
    } catch (error) {
      console.log(`Error reacting with emoji: ${error}`);
      return null;
    }
  }
}

module.exports = EmojiHandler;
