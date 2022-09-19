const SlashCommand = require("../../utils/slashCommands");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");
const title = require("../../gbfembedmessages.json");

const userSchema = require("../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const { delay } = require("../../utils/engine");

module.exports = class DunkelLuzProfile extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "account",
      description: "Economy account related commands",
      category: "Economy",
      userPermission: [],
      botPermission: [],
      cooldown: 5,
      development: true,
      subcommands: {
        login: {
          description:
            "Login to an existing DunkelLuz account or register a new account",
          args: [
            {
              name: "username",
              description:
                "The username of your DunkelLuz account [Case insensitive]",
              type: "STRING",
              minLength: 6,
              maxLength: 16,
              required: true,
            },
            {
              name: "password",
              description:
                "The password of your DunkelLuz account [Case sensitive]",
              type: "STRING",
              minLength: 8,
              maxLength: 32,
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            const accountName = interaction.options.getString("username");
            const accountPassword = interaction.options.getString("password");

            const userData = await userSchema.findOne({
              userNameInsensitive: accountName.toLowerCase(),
              accountPassword: accountPassword,
            });

            const alreadyLoggedIn = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot do that!`)
              .setDescription(`You're already logged into this account`)
              .setColor(colours.ERRORRED)
              .setTimestamp()
              .setFooter({
                text: `DunkelLuz`,
              });

            if (userData && userData.userId === interaction.user.id)
              return interaction.reply({
                embeds: [alreadyLoggedIn],
                ephemeral: true,
              });

            if (
              userData &&
              userData.userId !== null &&
              Date.parse(userData.lastTransfer) + 3 * 7 * 24 * 60 * 60 * 1000 >
                Date.now()
            ) {
              const newOwner = interaction.user;

              const existingAccount = new MessageEmbed()
                .setTitle(`${emojis.REMPEACE} Account Transfer`)
                .setDescription(
                  `By transferring \`${userData.userName}\` to ${newOwner.tag}, the account will be logged out from everywhere except here and you will have to wait **3 weeks** to log onto another account.`
                )
                .setColor(colours.DEFAULT)
                .setTimestamp();

              const onCooldown = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Not Yet!`)
                .setDescription(
                  `You can log into this account in **<t:${Math.floor(
                    userData.lastTransfer / 1000 + 3 * 7 * 24 * 60 * 60
                  )}:f>**`
                )
                .setColor(colours.ERRORRED)
                .setTimestamp();

              if (
                Date.parse(userData.lastTransfer) +
                  3 * 7 * 24 * 60 * 60 * 1000 <
                Date.now()
              )
                return interaction.reply({
                  embeds: [onCooldown],
                  ephemeral: true,
                });
              else {
                const transferButtons = new MessageActionRow().addComponents([
                  new MessageButton()
                    .setCustomId(`confirmTransfer`)
                    .setStyle("SUCCESS")
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Transfer`),
                  new MessageButton()
                    .setCustomId(`denyTransfer`)
                    .setStyle("DANGER")
                    .setEmoji(emojis.ERROR)
                    .setLabel(`Cancel`),
                ]);

                const transferButtonsD = new MessageActionRow().addComponents([
                  new MessageButton()
                    .setCustomId(`confirmTransferD`)
                    .setStyle("SUCCESS")
                    .setEmoji(emojis.VERIFY)
                    .setDisabled(true)
                    .setLabel(`Transfer`),
                  new MessageButton()
                    .setCustomId(`denyTransferD`)
                    .setStyle("DANGER")
                    .setEmoji(emojis.ERROR)
                    .setDisabled(true)
                    .setLabel(`Cancel`),
                ]);

                await interaction.reply({
                  embeds: [existingAccount],
                  components: [transferButtons],
                  ephemeral: true,
                });

                const filter = (i) => {
                  return i.user.id === interaction.user.id;
                };

                const collector =
                  interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 300000,
                  });

                collector.on("collect", async (i) => {
                  await i.deferUpdate();
                  await delay(750);

                  const denyTransferEmbed = new MessageEmbed()
                    .setTitle(`${emojis.ERROR} Transfer Cancelled`)
                    .setDescription(`Reason: User Cancelled Transfer`)
                    .setColor(colours.ERRORRED)
                    .setFooter({
                      text: `DunekelLuz | Account Transfer`,
                    })
                    .setTimestamp();

                  if (i.customId === "denyTransfer") {
                    await collector.stop();
                    return interaction.editReply({
                      embeds: [denyTransferEmbed],
                    });
                  }

                  if (i.customId === "confirmTransfer") {
                    await interaction.editReply({
                      embeds: [],
                      content: `Logging out from all logged in devices...`,
                      ephemeral: true,
                    });

                    const oldOwner = await userSchema.findOne({
                      userId: userData.userId,
                    });

                    if (!oldOwner) {
                      await collector.stop();
                      return interaction.editReply({
                        content: `I couldn't find the old owner, process aborted.`,
                      });
                    }

                    const oldAccount = await userSchema.findOne({
                      userId: interaction.user.id,
                    });

                    if (oldAccount)
                      await oldAccount.updateOne({
                        userId: null,
                      });

                    await oldOwner.updateOne({
                      userId: interaction.user.id,
                    });

                    await interaction.editReply({
                      content: `Successfully logged into ${userData.userName}`,
                    });
                  }
                });

                collector.on("end", async (i) => {
                  return interaction.editReply({
                    content: `Session ended.`,
                    components: [transferButtonsD],
                  });
                });
              }
            } else if (!userData) {
              const userHasAccount = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(
                  `You already have an account DunkelLuz account, if you lost access to that account please contact support or you can delete that account.`
                )
                .setColor(colours.ERRORRED)
                .setTimestamp();

              const userAccount = await userSchema.find({
                userId: interaction.user.id,
              });

              if (userAccount.length > 0)
                return interaction.reply({
                  embeds: [userHasAccount],
                  ephemeral: true,
                });

              const existingNickName = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Dupe protection`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The name provided (${accountName}) is already in use, please choose another name.`
                )
                .setFooter({
                  text: `GBF Security`,
                })
                .setTimestamp();

              const checkName = await userSchema.find({
                userName: accountName,
              });

              if (checkName.length > 0)
                return interaction.reply({
                  embeds: [existingNickName],
                  ephemeral: true,
                });

              const weakPassword = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Too weak!`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The password entered (\`${accountPassword}\`) is too weak, you must add at least one of each:\n• 2 Uppercase characters\n• 3 Lowercase characters\n• 2 Numbers`
                )
                .setFooter({
                  text: `GBF Security`,
                })
                .setTimestamp();

              const checkPasswordStrength =
                /(?=.*[A-Z].*[A-Z])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}/gi;

              if (!checkPasswordStrength.test(accountPassword))
                return interaction.reply({
                  embeds: [weakPassword],
                  ephemeral: true,
                });

              function userNameCheck(username) {
                const nWordCheck = /nigg/gi;
                const rWordCheck = /re[a-zA-Z]ard/gi;
                const fWordCheck = /[a-zA-Z]a[a-zA-Z]got/gi;

                if (
                  nWordCheck.test(username) ||
                  rWordCheck.test(username) ||
                  fWordCheck.test(username)
                )
                  return true;
                else return false;
              }

              const badUsername = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(
                  `The username entered has been flagged by our system as inappropriate, please choose another name.`
                )
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Security and safety | If you think this is a mistake please contact support`,
                })
                .setTimestamp();

              if (userNameCheck(accountName))
                return interaction.reply({
                  embeds: [badUsername],
                  ephemeral: true,
                });

              const newUserAccount = new userSchema({
                userId: interaction.user.id,
                userName: accountName,
                userNameInsensitive: accountName.toLowerCase(),
                accountPassword: accountPassword,
                lastTransfer: new Date(Date.now()),
              });

              await newUserAccount.save();

              const welcomeMessage = new MessageEmbed()
                .setTitle(`${emojis.TRACER} Welcome to DunkelLuz`)
                .setDescription(
                  `Account has been successfully created.\n\nUnlocked basic DunkelLuz features, to unlock the story missions and side features you must complete the tutorial: \`/intro\`\n\nIt is recommended to keep your account details in a safe place since they can be used to retrieve progress in-case you lost your discord account`
                )
                .addFields({
                  name: `Details:`,
                  value: `Username: ${accountName}\nPassword: ${accountPassword}\n\n⚠️ The account username is case-insensitive but the account password is case-sensitive ⚠️`,
                })
                .setColor(colours.DEFAULT)
                .setFooter({
                  text: `Welcome to DunkelLuz | The city of saints and sinners`,
                })
                .setTimestamp();

              return interaction.reply({
                embeds: [welcomeMessage],
                ephemeral: true,
              });
            }
          },
        },
      },
    });
  }
};
