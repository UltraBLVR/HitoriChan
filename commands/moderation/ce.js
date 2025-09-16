const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ce',
  description: 'Creates a custom embed.',
  options: [
    {
      name: 'title',
      description: 'The title of the embed.',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'description',
      description: 'The description of the embed.',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'color',
      description: 'The color of the embed (hex code).',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'footer',
      description: 'The footer of the embed.',
      required: false,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'image',
      description: 'The image URL of the embed.',
      required: false,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'thumbnail',
      description: 'The thumbnail URL of the embed.',
      required: false,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'author',
      description: 'The author of the embed.',
      required: false,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'field1',
      description: 'The fields of the embed (name:value).',
      required: false,
      type: ApplicationCommandOptionType.String
    },
  ],

  callback: async (client, interaction) => {
    const ce = new EmbedBuilder();
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color');
    const footer = interaction.options?.getString('footer');
    const image = interaction.options?.getString('image');
    const thumbnail = interaction.options?.getString('thumbnail');
    const author = interaction.options?.getString('author');
    const fields = interaction.options?.getString('fields');

    ce.setTitle(title);
    ce.setDescription(description);
    ce.setColor(color);
    if (footer) ce.setFooter({ text: footer });
    if (image) ce.setImage(image);
    if (thumbnail) ce.setThumbnail(thumbnail);
    if (author) ce.setAuthor({ name: author });
    if (fields) ce.setFields({ name: fields.split(':')[0], value: fields.split(':')[1] });
    await interaction.channel.send({ embeds: [ce] });
  }
};