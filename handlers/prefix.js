
const getLocalCommands = require('../utils/getLocalCommands');

class PrefixHandler {
  constructor(prefix = 'h') {
    this.prefix = prefix;
    this.localCommands = null;
  }

  // Load commands once and cache them
  loadCommands() {
    if (!this.localCommands) {
      this.localCommands = getLocalCommands();
    }
    return this.localCommands;
  }

  // Check if message should be handled
  shouldHandle(message) {
    return !message.author.bot && message.content.startsWith(this.prefix);
  }

  // Parse command and arguments
  parseCommand(message) {
    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    return { commandName, args };
  }

  // Find command object
  findCommand(commandName) {
    const commands = this.loadCommands();
    
    // Handle shortened commands
    const shortCommands = {
      'cf': 'coinflip',
      'b': 'bank',
      'p': 'pay',
      'd': 'daily'
    };
    
    const actualCommandName = shortCommands[commandName] || commandName;
    return commands.find(cmd => cmd.name === actualCommandName);
  }

  // Check permissions
  async checkPermissions(message, commandObject) {

    const { commandName, args } = this.parseCommand(message);
    if (!commandName) return;

    // Stop interaction command in prefix
    if (commandName === 'interaction') {
      try {
        await message.reply('❌ The `interaction` command can only be used as a slash command.');
      } catch(e) {
        console.error('Failed to reply about interaction prefix command:', e);
      }
      return; // exit early
    }
    
    // Check user permissions
    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!message.member.permissions.has(permission)) {
          await message.reply('❌ You don\'t have the required permissions to use this command.');
          return false;
        }
      }
    }

    // Check bot permissions
    if (commandObject.botPermissions?.length) {
      const bot = message.guild.members.me;
      for (const permission of commandObject.botPermissions) {
        if (!bot.permissions.has(permission)) {
          await message.reply('❌ I don\'t have the required permissions to execute this command.');
          return false;
        }
      }
    }

    return true;
  }

  // Create mock interaction object
  createMockInteraction(message, commandName, args, commandObject) {
    let isDeferred = false;
    let initialReply = null;

    return {
      reply: async (content) => {
        const options = typeof content === 'object' && content !== null ? content : {};
        const messageContent = typeof content === 'string' ? content : (content.content || null);

        if (options.ephemeral) {
          // Handle ephemeral messages with DM
          try {
            const dmContent = {};
            if (messageContent) dmContent.content = messageContent;
            if (content.embeds) dmContent.embeds = content.embeds;
            if (content.components) dmContent.components = content.components;
            if (!dmContent.content && !dmContent.embeds) {
              dmContent.content = 'No content provided';
            }
            
            initialReply = await message.author.send(dmContent);
            await message.reply('📬 I\'ve sent you a private message!');
            return initialReply;
          } catch (error) {
            // Fallback to public reply if DM fails
            const replyContent = {};
            if (messageContent) replyContent.content = messageContent;
            if (content.embeds) replyContent.embeds = content.embeds;
            if (content.components) replyContent.components = content.components;
            if (!replyContent.content && !replyContent.embeds) {
              replyContent.content = 'No content provided';
            }
            return message.reply(replyContent);
          }
        } else {
          // Handle normal replies
          const replyContent = {};
          if (messageContent) replyContent.content = messageContent;
          if (content.embeds) replyContent.embeds = content.embeds;
          if (content.components) replyContent.components = content.components;
          if (!replyContent.content && !replyContent.embeds) {
            replyContent.content = 'No content provided';
          }
          return message.reply(replyContent);
        }
      },

      deferReply: async (options = {}) => {
        isDeferred = true;
        // Don't send any message for prefix commands
        return null;
      },

      editReply: async (content) => {
        if (initialReply && isDeferred) {
          if (typeof content === 'string') {
            return await initialReply.edit(content);
          } else if (content.embeds) {
            return await initialReply.edit({ embeds: content.embeds });
          } else if (content.files) {
            return await initialReply.edit({ files: content.files });
          } else if (content.content) {
            return await initialReply.edit(content.content);
          } else {
            return await initialReply.edit('No content provided');
          }
        } else {
          // If not deferred, treat as reply
          if (typeof content === 'string') {
            return message.reply(content);
          } else if (content.embeds) {
            return message.reply({ embeds: content.embeds });
          } else if (content.files) {
            return message.reply({ files: content.files });
          } else if (content.content) {
            return message.reply(content.content);
          } else {
            return message.reply('No content provided');
          }
        }
      },

      fetchReply: async () => {
        return initialReply || message;
      },

      // Message properties
      createdTimestamp: message.createdTimestamp,
      member: message.member,
      guild: message.guild,
      user: message.author,
      channel: message.channel,
      commandName: commandName,

      // Guild check
      inGuild: () => message.guild !== null,

      // Options parser
      options: {
        get: (name) => {
          if (!commandObject.options) return null;

          // Special handling for specific commands
          if (commandName === 'coinflip' || commandName === 'cf') {
            if (name === 'choice') {
              const choiceValue = args[0];
              if (['heads', 'tails', 'h', 't'].includes(choiceValue?.toLowerCase())) {
                // Convert short forms to full forms
                const choice = choiceValue.toLowerCase();
                return { value: choice === 'h' ? 'heads' : choice === 't' ? 'tails' : choice };
              }
              return null;
            }
            if (name === 'amount') {
              const amountValue = args[1];
              return amountValue ? { value: amountValue } : null;
            }
          }
          
          if (commandName === 'bank' || commandName === 'b') {
            if (name === 'action') {
              const actionValue = args[0];
              if (['balance', 'deposit', 'withdraw'].includes(actionValue)) {
                return { value: actionValue };
              }
              return { value: 'balance' };
            }
            if (name === 'amount') {
              const amountRaw = args[1];
              if (!amountRaw) return null;

              if (amountRaw.endsWith('%')) {
                const percent = parseFloat(amountRaw.slice(0, -1));
                if (isNaN(percent)) return null;
                return { value: `${percent}%` }; // Pass as string to handle in command logic
              }

              const amountValue = parseInt(amountRaw);
              return isNaN(amountValue) ? null : { value: amountValue };
            }

          }
          
          if (commandName === 'pay' || commandName === 'p') {
            try { 
              if (name === 'user') {
                let userValue = args[0];
                if (!userValue) return null;

                if (userValue.startsWith('<@') && userValue.endsWith('>')) {
                  userValue = userValue.slice(2, -1);
                  if (userValue.startsWith('!')) {
                    userValue = userValue.slice(1);
                  }
                }

                if (!user) {
                  console.log('yes')
                }
                return { value: userValue };
              }
              if (name === 'amount') {
                const amountValue = parseInt(args[1]);
                return isNaN(amountValue) ? null : { value: amountValue };
              }
            } catch (err) {
              console.error(`Error parsing pay command options: ${err}`);
            }
          }

          if (commandName === 'say') {
            if (name === 'message') {
              // Join all arguments except channel mentions as the message
              const messageArgs = args.filter(arg => !arg.startsWith('<#'));
              return messageArgs.length > 0 ? { value: messageArgs.join(' ') } : null;
            }
            if (name === 'channel') {
              // Find channel mention in args
              const channelMention = args.find(arg => arg.startsWith('<#') && arg.endsWith('>'));
              if (channelMention) {
                const channelId = channelMention.slice(2, -1);
                const channel = message.guild.channels.cache.get(channelId);
                return channel ? { channel: channel } : null;
              }
              return null;
            }
          }

          if (commandName === 'membercount' || commandName === 'mc') {
            if (name === 'type') {
              const typeValue = args[0];
              if (['all', 'bots', 'humans'].includes(typeValue?.toLowerCase())) {
                return { value: typeValue.toLowerCase() };
              }
              return { value: 'all' }; // Default to 'all' if no valid type provided
            }
          }

          if (commandName === 'lb' || commandName === 'leaderboard' || commandName === 'top') {
            if (name === 'type') {
              const typeValue = args[0];
              if (['l', 'c'].includes(typeValue?.toLowerCase())) {
                return { value: typeValue.toLowerCase() };
              }
              return { value: 'l' }; // default
            }
          }

          // Default option handling
          const optionIndex = commandObject.options.findIndex(opt => opt.name === name);
          if (optionIndex === -1) return null;

          // Handle reason field specially - join remaining args
          if (name === 'reason') {
            const reasonArgs = args.slice(optionIndex);
            return reasonArgs.length > 0 ? { value: reasonArgs.join(' ') } : null;
          }

          let value = args[optionIndex] || null;
          if (!value) return null;

          // Handle user mentions
          if (value.startsWith('<@') && value.endsWith('>')) {
            value = value.slice(2, -1);
            if (value.startsWith('!')) {
              value = value.slice(1);
            }
          }

          return { value: value };
        }
      }
    };
  }

  // Main handler method
  async handleMessage(client, message) {
    try {
      if (!this.shouldHandle(message)) return;

      const { commandName, args } = this.parseCommand(message);
      if (!commandName) return;

      const commandObject = this.findCommand(commandName);
      if (!commandObject) return;

      // Validate command object
      if (!commandObject.callback || typeof commandObject.callback !== 'function') {
        console.error(`Command "${commandName}" does not have a valid callback function.`);
        await message.reply('❌ This command is not properly configured.');
        return;
      }

      // Check permissions
      const hasPermission = await this.checkPermissions(message, commandObject);
      if (!hasPermission) return;

      // Create mock interaction and execute command
      const mockInteraction = this.createMockInteraction(message, commandName, args, commandObject);
      await commandObject.callback(client, mockInteraction);

      // Delete the original message for the say command
      if (commandName === 'say') {
        try {
          await message.delete();
        } catch (deleteError) {
          console.log(`Could not delete original say command message: ${deleteError}`);
        }
      }
    } catch (error) {
      console.error(`Error executing prefix command:`, error);
      try {
        await message.reply('❌ An error occurred while executing this command.');
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  }
}

module.exports = PrefixHandler;
