const SlashCommand = require("../../utils/slashCommands");

const {
  MessageEmbed,
  Permissions,
  MessageAttachment,
  Constants
} = require("discord.js");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");
const titles = require("../../gbfembedmessages.json");

const DIG = require("discord-image-generation");
const fetch = require("node-fetch");

const loadingScreen = new MessageEmbed()
  .setTitle(`Generating image... <a:Loading:971730094169141248>`)
  .setColor(colours.DEFAULT)
  .setDescription(
    `Image generation time depends on image size and server load, please be patient.`
  )
  .setFooter({
    text: `GBF Meme Generator`
  })
  .setTimestamp();

const atleastOneArg = new MessageEmbed()
  .setTitle(titles.ERROR)
  .setColor(colours.ERRORRED)
  .setDescription(
    `You must provide at least one option to generate the image: \`image\` or \`user-avatar\``
  )
  .setFooter({
    text: `TIP: Image will always be chosen over user avatar.`
  })
  .setTimestamp();

const incorrectImage = new MessageEmbed()
  .setTitle(titles.ERROR)
  .setDescription(
    `The file provided is not a correct image file with the correct extension\nSupported extensions: \`png\` and \`jpg\``
  )
  .setColor(colours.ERRORRED)
  .setTimestamp();

module.exports = class MemeCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "meme",
      description: "Meme commands",
      category: "Memes",
      userPermission: ["ATTACH_FILES"],
      botPermission: ["SEND_MESSAGES", "EMBED_LINKS"],
      cooldown: 10,
      development: true,
      subcommands: {
        argue: {
          description: "Lisa Presentation meme template",
          args: [
            {
              name: "text",
              description: "The text that you want to put in the meme",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 5,
              maxLength: 290,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const userInput = interaction.options.getString("text");

            await interaction.reply({
              embeds: [loadingScreen]
            });

            try {
              const generatedImage = await new DIG.LisaPresentation().getImage(
                userInput
              );
              const finalImage = new MessageAttachment(
                generatedImage,
                "lisaPresentation.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in the LISA Meme command: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        beautiful: {
          description: 'Gravity Falls "this is beautiful" meme template',
          args: [
            {
              name: "image",
              description:
                "The image that you want to use in the meme [Top Priority]",
              type: Constants.ApplicationCommandOptionTypes.ATTACHMENT
            },
            {
              name: "user-avatar",
              description:
                "The user avatar that you want to use in the meme [Low Priority]",
              type: Constants.ApplicationCommandOptionTypes.USER
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedAttachment =
              interaction.options.getAttachment("image");
            const providedUser = interaction.options.getUser("user-avatar");

            if (!providedAttachment && !providedUser)
              return interaction.reply({
                embeds: [atleastOneArg],
                ephemeral: true
              });

            let usedImage;

            if (providedAttachment) usedImage = providedAttachment;
            else if (!providedAttachment)
              usedImage = providedUser.displayAvatarURL({
                format: "png"
              });

            if (usedImage === providedAttachment) {
              if (!providedAttachment.contentType.includes("image"))
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });

              if (
                !providedAttachment.contentType.includes("png") &&
                !providedAttachment.contentType.includes("jpg") &&
                !providedAttachment.contentType.includes("jpeg")
              )
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });

              usedImage = providedAttachment.url;
            }

            await interaction.reply({
              embeds: [loadingScreen]
            });
            try {
              const generatedImage = await new DIG.Beautiful().getImage(
                usedImage
              );

              const finalImage = new MessageAttachment(
                generatedImage,
                "beautiful.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in the BEAUTIFUL Meme command: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        clown: {
          description:
            'Teen Titans Go "This is a clown, star." meme template | FYI. You\'re the biggest clown',
          args: [
            {
              name: "image",
              description:
                "The image that you want to use in the meme [Top Priority]",
              type: Constants.ApplicationCommandOptionTypes.ATTACHMENT
            },
            {
              name: "user-avatar",
              description:
                "The user avatar that you want to use in the meme [Low Priority]",
              type: Constants.ApplicationCommandOptionTypes.USER
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedAttachment =
              interaction.options.getAttachment("image");
            const providedUser = interaction.options.getUser("user-avatar");

            if (!providedAttachment && !providedUser)
              return interaction.reply({
                embeds: [atleastOneArg],
                ephemeral: true
              });

            let usedImage;

            if (providedAttachment) usedImage = providedAttachment;
            else if (!providedAttachment)
              usedImage = providedUser.displayAvatarURL({
                format: "png"
              });

            if (usedImage === providedAttachment) {
              if (!providedAttachment.contentType.includes("image"))
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });
              if (
                !providedAttachment.contentType.includes("png") &&
                !providedAttachment.contentType.includes("jpg") &&
                !providedAttachment.contentType.includes("jpeg") &&
                !providedAttachment.url.includes("jpg") &&
                !providedAttachment.url.includes("png")
              )
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });

              usedImage = providedAttachment.url;
            }

            await interaction.reply({
              embeds: [loadingScreen]
            });
            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/clown?image=${usedImage}`
              ).then((response) => (generatedImage = response.url));

              const finalImage = new MessageAttachment(
                generatedImage,
                "clown.png"
              );
              finalImage.setDescription(
                `${interaction.user.username} is the biggest clown here`
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in the CLOWN Meme command: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        eddyfact: {
          description: `Eddy "This is a fact" book meme template`,
          args: [
            {
              name: "text",
              description: "The text that will be used in the template",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 2,
              maxLength: 200,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedText = interaction.options.getString("text");

            await interaction.reply({
              embeds: [loadingScreen]
            });

            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/edd-fact?text=${providedText}`
              ).then((response) => (generatedImage = response.url));

              const finalImage = new MessageAttachment(
                generatedImage,
                "fact.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in Eddy Meme Template: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        thisguy: {
          description: "Get a load of this guy meme template",
          args: [
            {
              name: "image",
              description:
                "The image that you want to use in the meme [Top Priority]",
              type: Constants.ApplicationCommandOptionTypes.ATTACHMENT
            },
            {
              name: "user-avatar",
              description:
                "The user avatar that you want to use in the meme [Low Priority]",
              type: Constants.ApplicationCommandOptionTypes.USER
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedAttachment =
              interaction.options.getAttachment("image");
            const providedUser = interaction.options.getUser("user-avatar");

            if (!providedAttachment && !providedUser)
              return interaction.reply({
                embeds: [atleastOneArg],
                ephemeral: true
              });

            let usedImage;

            if (providedAttachment) usedImage = providedAttachment;
            else if (!providedAttachment)
              usedImage = providedUser.displayAvatarURL({
                format: "png",
                size: 2048
              });

            if (usedImage === providedAttachment) {
              if (!providedAttachment.contentType.includes("image"))
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });
              if (
                !providedAttachment.contentType.includes("png") &&
                !providedAttachment.contentType.includes("jpg") &&
                !providedAttachment.contentType.includes("jpeg") &&
                !providedAttachment.url.includes("jpg") &&
                !providedAttachment.url.includes("png")
              )
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });

              usedImage = providedAttachment.url;
            }

            await interaction.reply({
              embeds: [loadingScreen]
            });
            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/thisguy?image=${usedImage}`
              ).then((response) => (generatedImage = response.url));

              const finalImage = new MessageAttachment(
                generatedImage,
                "clown.png"
              );
              finalImage.setDescription(
                `${interaction.user.username} is the biggest clown here`
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(
                `Error in the GET A LOAD OF THIS GUY Meme command: ${err}`
              );

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        supreme: {
          description: "Supreme goku meme template",
          args: [
            {
              name: "image",
              description:
                "The image that you want to use in the meme [Top Priority]",
              type: Constants.ApplicationCommandOptionTypes.ATTACHMENT
            },
            {
              name: "user-avatar",
              description:
                "The user avatar that you want to use in the meme [Low Priority]",
              type: Constants.ApplicationCommandOptionTypes.USER
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedAttachment =
              interaction.options.getAttachment("image");
            const providedUser = interaction.options.getUser("user-avatar");

            if (!providedAttachment && !providedUser)
              return interaction.reply({
                embeds: [atleastOneArg],
                ephemeral: true
              });

            let usedImage;

            if (providedAttachment) usedImage = providedAttachment;
            else if (!providedAttachment)
              usedImage = providedUser.displayAvatarURL({
                format: "png",
                size: 2048
              });

            if (usedImage === providedAttachment) {
              if (!providedAttachment.contentType.includes("image"))
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });
              if (
                !providedAttachment.contentType.includes("png") &&
                !providedAttachment.contentType.includes("jpg") &&
                !providedAttachment.contentType.includes("jpeg") &&
                !providedAttachment.url.includes("jpg") &&
                !providedAttachment.url.includes("png")
              )
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });

              usedImage = providedAttachment.url;
            }

            await interaction.reply({
              embeds: [loadingScreen]
            });
            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/supreme?image=${usedImage}`
              ).then((response) => {
                generatedImage = response.url;
              });

              const finalImage = new MessageAttachment(
                generatedImage,
                "supreme.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in the Supreme Meme command: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        dislike: {
          description: "Everyone disliked that meme template",
          args: [
            {
              name: "image",
              description:
                "The image that you want to use in the meme [Top Priority]",
              type: Constants.ApplicationCommandOptionTypes.ATTACHMENT
            },
            {
              name: "user-avatar",
              description:
                "The user avatar that you want to use in the meme [Low Priority]",
              type: Constants.ApplicationCommandOptionTypes.USER
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedAttachment =
              interaction.options.getAttachment("image");
            const providedUser = interaction.options.getUser("user-avatar");

            if (!providedAttachment && !providedUser)
              return interaction.reply({
                embeds: [atleastOneArg],
                ephemeral: true
              });

            let usedImage;

            if (providedAttachment) usedImage = providedAttachment;
            else if (!providedAttachment)
              usedImage = providedUser.displayAvatarURL({
                format: "png",
                size: 2048
              });

            if (usedImage === providedAttachment) {
              if (!providedAttachment.contentType.includes("image"))
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });
              if (
                !providedAttachment.contentType.includes("png") &&
                !providedAttachment.contentType.includes("jpg") &&
                !providedAttachment.contentType.includes("jpeg") &&
                !providedAttachment.url.includes("jpg") &&
                !providedAttachment.url.includes("png")
              )
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });

              usedImage = providedAttachment.url;
            }

            await interaction.reply({
              embeds: [loadingScreen]
            });
            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/dislike?image=${usedImage}`
              ).then((response) => {
                generatedImage = response.url;
              });

              const finalImage = new MessageAttachment(
                generatedImage,
                "disliked.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in the Disliked Meme command: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        shit: {
          description: '"Ew I stepped in shit" meme template',
          args: [
            {
              name: "image",
              description:
                "The image that you want to use in the meme [Top Priority]",
              type: Constants.ApplicationCommandOptionTypes.ATTACHMENT
            },
            {
              name: "user-avatar",
              description:
                "The user avatar that you want to use in the meme [Low Priority]",
              type: Constants.ApplicationCommandOptionTypes.USER
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedAttachment =
              interaction.options.getAttachment("image");
            const providedUser = interaction.options.getUser("user-avatar");

            if (!providedAttachment && !providedUser)
              return interaction.reply({
                embeds: [atleastOneArg],
                ephemeral: true
              });

            let usedImage;

            if (providedAttachment) usedImage = providedAttachment;
            else if (!providedAttachment)
              usedImage = providedUser.displayAvatarURL({
                format: "png",
                size: 2048
              });

            if (usedImage === providedAttachment) {
              if (!providedAttachment.contentType.includes("image"))
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });
              if (
                !providedAttachment.contentType.includes("png") &&
                !providedAttachment.contentType.includes("jpg") &&
                !providedAttachment.contentType.includes("jpeg") &&
                !providedAttachment.url.includes("jpg") &&
                !providedAttachment.url.includes("png")
              )
                return interaction.reply({
                  embeds: [incorrectImage],
                  ephemeral: true
                });

              usedImage = providedAttachment.url;
            }

            await interaction.reply({
              embeds: [loadingScreen]
            });
            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/steppedinshit?image=${usedImage}`
              ).then((response) => {
                generatedImage = response.url;
              });

              const finalImage = new MessageAttachment(
                generatedImage,
                "shit.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in the Shit Meme command: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        burn: {
          description: `"Spongebob burn paper" book meme template`,
          args: [
            {
              name: "text",
              description: "The text that will be used in the template",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 2,
              maxLength: 200,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedText = interaction.options.getString("text");

            await interaction.reply({
              embeds: [loadingScreen]
            });

            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/burn?text=${providedText}`
              ).then((response) => (generatedImage = response.url));

              const finalImage = new MessageAttachment(
                generatedImage,
                "burn.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in Burn Meme Template: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        },
        read: {
          description: `"If those kids could read they'd be very upset" meme template`,
          args: [
            {
              name: "text",
              description: "The text that will be used in the template",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 2,
              maxLength: 200,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const providedText = interaction.options.getString("text");

            await interaction.reply({
              embeds: [loadingScreen]
            });

            try {
              let generatedImage;

              await fetch(
                `https://luminabot.xyz/api/image/couldread?text=${providedText}`
              ).then((response) => (generatedImage = response.url));

              const finalImage = new MessageAttachment(
                generatedImage,
                "read.png"
              );

              return interaction.editReply({
                files: [finalImage],
                embeds: []
              });
            } catch (err) {
              console.log(`Error in couldread Meme Template: ${err}`);

              loadingScreen
                .setTitle(titles.ERROR)
                .setDescription(
                  `An API error occured, I've already reported it to my developers!\nPlease try again later.\nError:\n\n\`\`\`js\n${err}\`\`\``
                )
                .setColor(colours.ERRORRED);

              interaction
                .editReply({
                  content: `This message will be deleted in 10 seconds.`,
                  embeds: [loadingScreen]
                })
                .then(() => {
                  setTimeout(() => {
                    return interaction.deleteReply();
                  }, 10000);
                });
            }
          }
        }
      }
    });
  }
};
