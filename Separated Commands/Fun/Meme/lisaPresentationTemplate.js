//The package that we're using
const DIG = require("discord-image-generation");

const {
  MessageEmbed,
  Constants,
  MessageAttachment
} = require("discord.js");
//The message that will be sent while the image generates, you can replace this with *bot is thinking* (deferReply) but I prefer this to give the user a better idea on what's going on
//We can also later edit this incase of an error 
const loadingScreen = new MessageEmbed()
  .setTitle(`Generating image... <a:Loading:971730094169141248>`)
  .setColor(colours.DEFAULT)
  .setDescription(
    `Image generation time depends on image size and server load, please be patient.`
  )
  .setFooter({
    text: `GBF Meme Generator`,
  })
  .setTimestamp();
//The slash command options
args: [{
    name: "text",
    description: "The text that you want to put in the meme",
    type: Constants.ApplicationCommandOptionTypes.STRING,
    minLength: 5,
    maxLength: 290,
    required: true,
},],
//The user input
const userInput = interaction.options.getString("text");
//For TypeScript you simple do
const userInput = interaction.options.getString("text", true);
//Sending the user the loading embed while the image generates
await interaction.reply({
  embeds: [loadingScreen],
});
//Generating the image 
const generatedImage = await new DIG.LisaPresentation().getImage(
  userInput
);
const finalImage = new MessageAttachment(
  generatedImage,
  "lisaPresentation.png"
);
//Sending the image once generated
return interaction.editReply({
  files: [finalImage],
  embeds: [],
}).catch((async (err) => { //If an error occurs we edit the embed and console log the error
    console.log(`Error in the LISA Meme command: ${err}`);
    loadingScreen.setTitle(titles.ERROR)
    .setDescription(`An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``)
    .setColor(colours.ERRORRED);
    await interaction.editReply({
        content: `This message will be deleted in 10 seconds.`,
        embeds: [loadingScreen]
    })
    //Deleting the embed
    setTimeout(() => { return interaction.deleteReply() } , 10000);
})
