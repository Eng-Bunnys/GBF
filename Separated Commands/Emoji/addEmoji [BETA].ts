  //The code has not been fully tested yet, once the full thing is testetd and complete the [BETA] tag will be removed
  options: [
    {
      name: "emoji-name",
      description: "The name of the emoji",
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: true,
      minLength: 2,
      maxLength: 32,
    },
    {
      name: "emoji-url",
      description:
        "An image URL for the emoji || If attachment is used, attachment will be used instead",
      type: Constants.ApplicationCommandOptionTypes.STRING,
    },
    {
      name: "emoji-attachment",
      description: "An attachment for the emoji || Will always be used",
      type: Constants.ApplicationCommandOptionTypes.ATTACHMENT,
    },
  ]

    const emojiName = interaction.options.getString("emoji-name");
    const emojiURL = interaction.options.getString("emoji-url");
    const emojiAttachment =
      interaction.options.getAttachment("emoji-attachment");

    const optionRequired = new MessageEmbed()
      .setTitle(`Missing required option`)
      .setColor("#e91e63")
      .setDescription(
        `You need to specify at least \`emoji-url\` or \`emoji-attachment\``
      );

    if (!emojiURL && !emojiAttachment)
      return interaction.reply({
        embeds: [optionRequired],
        ephemeral: true,
      });

    let usedEmoji;

    if (emojiURL && emojiAttachment) usedEmoji = emojiAttachment;
    else if (emojiURL) usedEmoji = emojiURL;
    else if (emojiAttachment) usedEmoji = emojiAttachment;

    const invalidImageURL = new MessageEmbed()
      .setTitle(`Invalid image URL`)
      .setColor("#e91e63")
      .setDescription(
        `The URL you provided has been flagged as an invalid image URL || Please make sure it ends with the extension \`.jpg\`, \`.png\`, or \`.gif\``
      );

    if (usedEmoji === emojiURL && !checkImage(emojiURL))
      return interaction.reply({
        embeds: [invalidImageURL],
        ephemeral: true,
      });

    const tooBig = new MessageEmbed()
      .setTitle(`Image is too big`)
      .setColor("#e91e63")
      .setDescription(`The image you provided is too big`);

    if (usedEmoji === emojiAttachment && emojiAttachment.size > 1024 * 1024)
      return interaction.reply({
        embeds: [tooBig],
        ephemeral: true,
      });

    const invalidType = new MessageEmbed()
      .setTitle(`Invalid attachment input`)
      .setColor("#e91e63")
      .setDescription(
        `The attachment you provided has been flagged as an invalid image  || Please make sure it ends with the extension \`.jpg\`, \`.png\`, or \`.gif\``
      );

    if (
      usedEmoji === emojiAttachment &&
      !emojiAttachment.contentType?.includes("image")
    )
      return interaction.reply({
        embeds: [invalidType],
        ephemeral: true,
      });

    if (usedEmoji === emojiAttachment) usedEmoji = emojiAttachment.url;
    let addedEmoji;
    try {
      addedEmoji = await interaction.guild?.emojis.create(
        usedEmoji as BufferResolvable,
        emojiName as string
      );
    } catch (err) {
      console.log(err);
      const errorMessage = new MessageEmbed()
        .setTitle(`I ran into an error`)
        .setDescription(
          `An error occurred while trying to add the emoji || Please try again later\n\nError:\n\`\`\`js\n${err}\`\`\``
        )
        .setColor("#e91e63");

      return interaction.reply({
        embeds: [errorMessage],
        ephemeral: true,
      });
    }

    const emojiEmbed = new MessageEmbed()
      .setTitle(` Successfully added the emoji: **${addedEmoji!.name}**`)
      .setDescription(
        `• Emoji name: ${addedEmoji!.name}\n• Emoji ID: ${
          addedEmoji!.id
        }\n• URL: [Emoji URL](${emojiURL})\n• Added by: ${interaction.user}`
      )
      .setColor("#e91e63")
      .setFooter({
        text: `Want emoji update logs? Join GBF logging /logs emojis`,
        iconURL: interaction.user!.displayAvatarURL(),
      })
      .setTimestamp();

    const newEmoji = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel(addedEmoji!.name!)
        .setStyle("LINK")
        .setEmoji(addedEmoji!)
        .setURL(`https://discordapp.com/emojis/${addedEmoji!.id}`)
    );

    return interaction.reply({
      embeds: [emojiEmbed],
      components: [newEmoji],
    });
