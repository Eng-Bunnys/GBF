//The options for the slash commands
args: [
    {
      name: "image",
      description:
        "The image that you want to use in the meme [Top Priority]",
      type: Constants.ApplicationCommandOptionTypes.ATTACHMENT,
    },
    {
      name: "user-avatar",
      description:
        "The user avatar that you want to use in the meme [Low Priority]",
      type: Constants.ApplicationCommandOptionTypes.USER,
    },
  ],

const providedAttachment =
  interaction.options.getAttachment("image");
const providedUser = interaction.options.getUser("user-avatar");
//If the user didn't provide either either options 
if (!providedAttachment && !providedUser)
  return interaction.reply({
    embeds: [atleastOneArg],
    ephemeral: true,
  });

let usedImage;
//Making a priority system so that if the user provided both if only chooses attachment
if (providedAttachment) usedImage = providedAttachment;
else if (!providedAttachment)
  usedImage = providedUser.displayAvatarURL({
    format: "png", //Changing the type to png to avoid any stupid errors during generation
  });
//If the user provided attachment
if (usedImage === providedAttachment) {
  //Checking if the attachment type is an image
  if (!providedAttachment.contentType.includes("image"))
    return interaction.reply({
      embeds: [incorrectImage],
      ephemeral: true,
    });
//Checking the attachment image type
  if (
    !providedAttachment.contentType.includes("png") &&
    !providedAttachment.contentType.includes("jpg") &&
    !providedAttachment.contentType.includes("jpeg")
  )
    return interaction.reply({
      embeds: [incorrectImage],
      ephemeral: true,
    });
  //To be able to input it in the generator
  usedImage = providedAttachment.url;
}
//Starting the loading screen
await interaction.reply({
  embeds: [loadingScreen],
});
//Generating the image
const generatedImage = await new DIG.Beautiful().getImage(
  usedImage
);
//Making it a message attachment
const finalImage = new MessageAttachment(
  generatedImage,
  "beautiful.png"
);
//Sending the attachment to the user & deleting the embed
return interaction
  .editReply({
    files: [finalImage],
    embeds: [],
  })
  .catch(async (err) => { //Incase of an error
    console.log(`Error in the BEAUTIFUL Meme command: ${err}`);
    loadingScreen
      .setTitle(titles.ERROR)
      .setDescription(
        `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
      )
      .setColor(colours.ERRORRED);
    await interaction.editReply({
      content: `This message will be deleted in 10 seconds.`,
      embeds: [loadingScreen],
    });
    setTimeout(() => {
      return interaction.deleteReply();
    }, 10000);
  });
