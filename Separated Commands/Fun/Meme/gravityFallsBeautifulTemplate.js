//The same idea as the Lisa Presentation but this time with avatar and image attachment
args: [
    {
      name: "image",
      description:
        "The image that you want to use in this meme [Top priority]",
      type: "ATTACHMENT",
      required: false,
    },
    {
      name: "avatar",
      description: "Use a user's avatar in the meme [Low priority]",
      type: "USER",
      required: false,
    },
  ],

  const imageAttachment = interaction.options.getAttachment("image");
  const userURL = interaction.options.getUser("avatar");

  const userAvatar = userURL
    ? userURL.displayAvatarURL({
        format: "png",
      })
    : interaction.user.displayAvatarURL({
        format: "png",
      });

  const noInput = new MessageEmbed()
    .setTitle(`You can't do that`)
    .setDescription(
      `Please provide either an image or a user\nImage will always be chosen over user if both are provided`
    )
    .setColor(colours.ERRORRED)
    .setTimestamp();

  if (!imageAttachment && !userURL)
    return interaction.reply({
      embeds: [noInput],
      ephemeral: true,
    });

  let imageUsed;

  if (imageAttachment) imageUsed = imageAttachment.url;
  else if (!imageAttachment && userURL) imageUsed = userAvatar;
  else
    return interaction.reply({
      embeds: [noInput],
      ephemeral: true,
    });

  if (imageUsed === imageAttachment.url) {
    const incorrectImage = new MessageEmbed()
      .setTitle(titles.ERROR)
      .setDescription(
        `The file provided is not a correct image file with the correct extension\nSupported extensions: \`png\`, \`jpg\` and\`jpeg\``
      )
      .setColor(colours.ERRORRED)
      .setTimestamp();

    if (!imageAttachment.contentType.includes("image"))
      return interaction.reply({
        embeds: [incorrectImage],
        ephemeral: true,
      });

    if (
      !imageAttachment.contentType.includes("png") &&
      !imageAttachment.contentType.includes("jpeg") &&
      !imageAttachment.contentType.includes("jpg")
    )
      return interaction.reply({
        embeds: [incorrectImage],
        ephemeral: true,
      });

    await interaction.reply({
      embeds: [ImageGenerating],
    });

    const generatedImage = await new DIG.Beautiful().getImage(
      imageUsed
    );
    const messageAttach = new MessageAttachment(
      generatedImage,
      "beautiful.png"
    );

    return interaction
      .editReply({
        embeds: [],
        files: [messageAttach],
      })
      .catch((err) => {
        console.log(`Error with Meme command [BEAUTIFUL]\n${err}`);
        return interaction.followUp({
          embeds: [APIError],
          ephemeral: true,
        });
      });
  
