//The package we're using, you could of-course make it yourself it's simple image manipulation using canvas
const DIG = require("discord-image-generation");
//You could also do 
const { LisaPresentation } = require('discord-image-generation');
//I didn't do this here since all of the meme commands are in one file (subCommand) but if you're just going to use this, use the import shown above
//The user input
args: [
  {
    name: "text",
    description: "The text that you want to display",
    type: "STRING",
    required: true,
  },
],
 //Defering the reply so in the case of the bot taking long to generate the image and send it, it doesn't give an error to the user
await interaction.deferReply({
    fetchReply: true,
  });
//Loading screen 
const ImageGenerating = new MessageEmbed()
  .setTitle(`Generating image... <a:Loading:971730094169141248>`)
  .setColor(colours.DEFAULT)
  .setDescription(
    `This may take up to 2 minutes (Average 10s) depending on quality and server load`
  )
  .setTimestamp();
//Editing the deferReply to the loading screen
await interaction.editReply({
  embeds: [ImageGenerating],
});
//The user option
const text = interaction.options.getString("text");
//Checking if the user added text that is too big to avoid errors
if (text.length > 290) {
  return interaction.reply({
    content: "Over the character limit! Character limit is 290.",
    ephemeral: true,
  });
}
//Creating the message attachment 
let image = await new DIG.LisaPresentation().getImage(text);
let attach = new MessageAttachment(image, "presentation.png");
//Sending the user the image and removing the embed
return interaction
  .editReply({
    files: [attach],
    embeds: [],
  })
  //Incase of an error 
  .catch((err) => {
    const APIError = new MessageEmbed()
      .setTitle(titles.ERROR)
      .setDescription(
        `An error in the API occured, I've already reported it to my developers!\nPlease try again later.\n\nError:\`\`\`js\n${err}\`\`\``
      )
      .setColor(colours.ERRORRED)
      .addFields({
        name: "FYI:",
        value: `\`User aborted the request\` error just means that the bot is under load`,
      })
      .setFooter({
        text: `We apologize for the inconvenience`,
        iconURL: client.user.displayAvatarURL(),
      });
    console.log(`Error with Meme command [LISA]\n${err}`);
    
    return interaction.followUp({
      embeds: [APIError],
      ephemeral: true,
    });
  });
