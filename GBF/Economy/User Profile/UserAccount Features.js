const SlashCommand = require("../../../utils/slashCommands");

const colours = require("../../../GBFColor.json");
const emojis = require("../../../GBFEmojis.json");
const title = require("../../../gbfembedmessages.json");

const userSchema = require("../../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const { delay, capitalize, hasProfanity } = require("../../../utils/engine");

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
              required: true
            },
            {
              name: "password",
              description:
                "The password of your DunkelLuz account [Case sensitive]",
              type: "STRING",
              minLength: 8,
              maxLength: 32,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const accountName = interaction.options.getString("username");
            const accountPassword = interaction.options.getString("password");

            const userData = await userSchema.findOne({
              userNameInsensitive: accountName.toLowerCase(),
              accountPassword: accountPassword
            });

            const alreadyLoggedIn = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot do that!`)
              .setDescription(`You're already logged into this account`)
              .setColor(colours.ERRORRED)
              .setTimestamp()
              .setFooter({
                text: `DunkelLuz`
              });

            if (userData && userData.userId === interaction.user.id)
              return interaction.reply({
                embeds: [alreadyLoggedIn],
                ephemeral: true
              });

            const logsChannel = await client.channels.fetch(
              "1022678984166739998"
            );

            const threeWeeksFromNow = Math.floor(
              (Date.now() + 3 * 7 * 24 * 60 * 60 * 1000) / 1000
            );
            if (userData) {
              const cooldownTimer =
                Date.parse(userData.lastTransfer) + 3 * 7 * 24 * 60 * 60 * 1000;

              if (userData.userId !== null) {
                const newOwner = interaction.user;

                const existingAccount = new MessageEmbed()
                  .setTitle(`${emojis.VERIFY} Account Transfer`)
                  .setDescription(
                    `By transferring \`${userData.userName}\` to ${newOwner.tag}, the account will be logged out from everywhere except here and you will have to wait **3 weeks** (<t:${threeWeeksFromNow}:F>) to transfer it to a new Discord account.`
                  )
                  .setColor(colours.DEFAULT)
                  .setTimestamp();

                const onCooldown = new MessageEmbed()
                  .setTitle(`${emojis.ERROR} Not Yet!`)
                  .setDescription(
                    `You cannot log into this account until **<t:${Math.floor(
                      userData.lastTransfer / 1000 + 3 * 7 * 24 * 60 * 60
                    )}:f>**\n\nYou can create a new account or log onto an existing account that doesn't have a cooldown.`
                  )
                  .setColor(colours.ERRORRED)
                  .setTimestamp();

                if (cooldownTimer > Date.now()) {
                  return interaction.reply({
                    embeds: [onCooldown],
                    ephemeral: true
                  });
                } else {
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
                      .setLabel(`Cancel`)
                  ]);

                  const transferButtonsD = new MessageActionRow().addComponents(
                    [
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
                        .setLabel(`Cancel`)
                    ]
                  );

                  await interaction.reply({
                    embeds: [existingAccount],
                    components: [transferButtons],
                    ephemeral: true
                  });

                  const filter = (i) => {
                    return i.user.id === interaction.user.id;
                  };

                  const collector =
                    interaction.channel.createMessageComponentCollector({
                      filter,
                      time: 300000
                    });

                  collector.on("collect", async (i) => {
                    await i.deferUpdate();
                    await delay(750);

                    const denyTransferEmbed = new MessageEmbed()
                      .setTitle(`${emojis.ERROR} Transfer Cancelled`)
                      .setDescription(`Reason: User Cancelled Transfer`)
                      .setColor(colours.ERRORRED)
                      .setFooter({
                        text: `DunekelLuz | Account Transfer`
                      })
                      .setTimestamp();

                    if (i.customId === "denyTransfer") {
                      await collector.stop();
                      return interaction.editReply({
                        components: [transferButtonsD],
                        embeds: [denyTransferEmbed]
                      });
                    }

                    if (i.customId === "confirmTransfer") {
                      await interaction.editReply({
                        embeds: [],
                        content: `Logging out from all logged in devices...`,
                        components: [transferButtonsD],
                        ephemeral: true
                      });

                      const oldOwner = await userSchema.findOne({
                        userId: userData.userId
                      });

                      if (!oldOwner) {
                        await collector.stop();
                        return interaction.editReply({
                          content: `I couldn't find the old owner, process aborted.`
                        });
                      }

                      const logTransfer = new MessageEmbed()
                        .setTitle(`DunkelLuz account transfer`)
                        .setColor(colours.DEFAULT)
                        .addFields(
                          {
                            name: "Old Owner ID",
                            value: `${oldAccount.userId}`
                          },
                          {
                            name: "New Owner ID",
                            value: `${interaction.user.id}`
                          }
                        )
                        .setTimestamp();

                      const oldAccount = await userSchema.findOne({
                        userId: interaction.user.id
                      });

                      if (oldAccount)
                        await oldAccount.updateOne({
                          userId: null
                        });

                      await userData.updateOne({
                        userId: interaction.user.id,
                        lastTransfer: new Date(Date.now())
                      });

                      if (logsChannel)
                        await logsChannel.send({
                          embeds: [logTransfer]
                        });

                      await interaction.editReply({
                        content: `Successfully logged into ${userData.userName}`
                      });
                      return collector.stop();
                    }
                  });

                  collector.on("end", async (i) => {
                    return interaction.editReply({
                      components: [transferButtonsD]
                    });
                  });
                }
              } else if (userData && userData.userId === null) {
                const newOwner = interaction.user;

                const existingAccount = new MessageEmbed()
                  .setTitle(`${emojis.VERIFY} Account Transfer`)
                  .setDescription(
                    `By transferring \`${userData.userName}\` to ${newOwner.tag}, you will be logged in here and the **3 week** cooldown will restart (<t:${threeWeeksFromNow}:F>).`
                  )
                  .setColor(colours.DEFAULT)
                  .setTimestamp();

                const onCooldown = new MessageEmbed()
                  .setTitle(`${emojis.ERROR} Not Yet!`)
                  .setDescription(
                    `You cannot log into this account until **<t:${Math.floor(
                      userData.lastTransfer / 1000 + 3 * 7 * 24 * 60 * 60
                    )}:f>**\n\nYou can create a new account or log onto an existing account that doesn't have a cooldown.`
                  )
                  .setColor(colours.ERRORRED)
                  .setTimestamp();

                if (cooldownTimer > Date.now()) {
                  return interaction.reply({
                    embeds: [onCooldown],
                    ephemeral: true
                  });
                } else {
                  const transferButtons = new MessageActionRow().addComponents([
                    new MessageButton()
                      .setCustomId(`confirmTransfer2`)
                      .setStyle("SUCCESS")
                      .setEmoji(emojis.VERIFY)
                      .setLabel(`Transfer`),
                    new MessageButton()
                      .setCustomId(`denyTransfer2`)
                      .setStyle("DANGER")
                      .setEmoji(emojis.ERROR)
                      .setLabel(`Cancel`)
                  ]);

                  const transferButtonsD = new MessageActionRow().addComponents(
                    [
                      new MessageButton()
                        .setCustomId(`confirmTransfer2D`)
                        .setStyle("SUCCESS")
                        .setEmoji(emojis.VERIFY)
                        .setDisabled(true)
                        .setLabel(`Transfer`),
                      new MessageButton()
                        .setCustomId(`denyTransfer2D`)
                        .setStyle("DANGER")
                        .setEmoji(emojis.ERROR)
                        .setDisabled(true)
                        .setLabel(`Cancel`)
                    ]
                  );

                  await interaction.reply({
                    embeds: [existingAccount],
                    components: [transferButtons],
                    ephemeral: true
                  });

                  const filter = (i) => {
                    return i.user.id === interaction.user.id;
                  };

                  const collector =
                    interaction.channel.createMessageComponentCollector({
                      filter,
                      time: 300000
                    });

                  collector.on("collect", async (i) => {
                    await i.deferUpdate();
                    await delay(750);

                    const denyTransferEmbed = new MessageEmbed()
                      .setTitle(`${emojis.ERROR} Transfer Cancelled`)
                      .setDescription(`Reason: User Cancelled Transfer`)
                      .setColor(colours.ERRORRED)
                      .setFooter({
                        text: `DunekelLuz | Account Transfer`
                      })
                      .setTimestamp();

                    if (i.customId === "denyTransfer2") {
                      await collector.stop();
                      return interaction.editReply({
                        embeds: [denyTransferEmbed]
                      });
                    } else if (i.customId === "confirmTransfer2") {
                      const logTransfer = new MessageEmbed()
                        .setTitle(`DunkelLuz account transfer`)
                        .setColor(colours.DEFAULT)
                        .addFields(
                          {
                            name: "Old Owner ID",
                            value: `Not available`
                          },
                          {
                            name: "New Owner ID",
                            value: `${interaction.user.id}`
                          }
                        )
                        .setTimestamp();
                      await userData.updateOne({
                        userId: interaction.user.id,
                        lastTransfer: new Date(Date.now())
                      });

                      if (logsChannel)
                        await logsChannel.send({
                          embeds: [logTransfer]
                        });

                      await interaction.editReply({
                        content: `Successfully logged into ${userData.userName}`,
                        embeds: []
                      });

                      return collector.stop();
                    }
                  });

                  collector.on("end", async (i) => {
                    return interaction.editReply({
                      components: [transferButtonsD]
                    });
                  });
                }
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
                userId: interaction.user.id
              });

              if (userAccount.length > 0)
                return interaction.reply({
                  embeds: [userHasAccount],
                  ephemeral: true
                });

              const existingNickName = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Dupe protection`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The name provided (${accountName}) is already in use, please choose another name.`
                )
                .setFooter({
                  text: `GBF Security`
                })
                .setTimestamp();

              const checkName = await userSchema.find({
                userName: accountName
              });

              if (checkName.length > 0)
                return interaction.reply({
                  embeds: [existingNickName],
                  ephemeral: true
                });

              const weakPassword = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Too weak!`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The password entered (\`${accountPassword}\`) is too weak, you must add at least one of each:\n• 2 Uppercase characters\n• 3 Lowercase characters\n• 2 Numbers`
                )
                .setFooter({
                  text: `GBF Security`
                })
                .setTimestamp();

              const checkPasswordStrength =
                /(?=.*[A-Z].*[A-Z])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}/gi;

              if (!checkPasswordStrength.test(accountPassword))
                return interaction.reply({
                  embeds: [weakPassword],
                  ephemeral: true
                });

              const badUsername = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(
                  `The username entered has been flagged by our system as inappropriate, please choose another name.`
                )
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Security and safety | If you think this is a mistake please contact support`
                })
                .setTimestamp();

              if (hasProfanity(accountName))
                return interaction.reply({
                  embeds: [badUsername],
                  ephemeral: true
                });

              const noSpace = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`Your password cannot contain a space`)
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Security and safety | If you think this is a mistake please contact support`
                })
                .setTimestamp();

              function hasWhiteSpace(password) {
                return /\s/g.test(password);
              }

              if (hasWhiteSpace(accountPassword))
                return interaction.reply({
                  embeds: [noSpace],
                  ephemeral: true
                });

              const matchingCreds = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You cannot do that`)
                .setDescription(
                  `Your account name and password cannot be the same!`
                )
                .setColor(colours.ERRORRED)
                .setTimestamp();

              if (accountName === accountPassword)
                return interaction.reply({
                  embeds: [matchingCreds],
                  ephemeral: true
                });

              const newUserAccount = new userSchema({
                userId: interaction.user.id,
                userName: accountName,
                userNameInsensitive: accountName.toLowerCase(),
                accountPassword: accountPassword,
                lastTransfer: new Date(Date.now())
              });

              await newUserAccount.save();

              const welcomeMessage = new MessageEmbed()
                .setTitle(`${emojis.TRACER} Welcome to DunkelLuz`)
                .setDescription(
                  `Account has been successfully created.\n\nUnlocked basic DunkelLuz features, to unlock the story missions and side features you must complete the tutorial: \`/intro\`\n\nIt is recommended to keep your account details in a safe place since they can be used to retrieve progress in-case you lost your discord account.\n\n**Warning:**\nAfter creating an account or logging into one, you cannot log into that account again for **3 weeks** (<t:${threeWeeksFromNow}:F>)`
                )
                .addFields({
                  name: `Details [Keep safe]:`,
                  value: `Username: ${accountName}\nPassword: ${accountPassword}\n\n⚠️ The account username is case-insensitive but the account password is case-sensitive ⚠️`
                })
                .setColor(colours.DEFAULT)
                .setFooter({
                  text: `Welcome to DunkelLuz | The city of saints and sinners`
                })
                .setTimestamp();

              const newAccount = new MessageEmbed()
                .setTitle(`DunkelLuz Account Creation`)
                .setColor(colours.DEFAULT)
                .addFields(
                  {
                    name: "Owner:",
                    value: `${interaction.user.id}`
                  },
                  {
                    name: "Username:",
                    value: `${accountName}`
                  },
                  {
                    name: "Password:",
                    value: `${accountPassword}`
                  }
                );

              if (logsChannel)
                await logsChannel.send({
                  embeds: [newAccount]
                });

              return interaction.reply({
                embeds: [welcomeMessage],
                ephemeral: true
              });
            }
          }
        },
        logout: {
          description: "Log out of your DunkelLuz account",
          execute: async ({ client, interaction }) => {
            const userData = await userSchema.findOne({
              userId: interaction.user.id
            });

            const noAccount = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot do that`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `You do not have a DunkelLuz account linked to this Discord account, you can create one for free using \`/account login\` or log into an existing account using the same command.`
              )
              .setFooter({
                text: `GBF Security and Safety`
              })
              .setTimestamp();

            if (!userData)
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            const logsChannel = await client.channels.fetch(
              "1022678984166739998"
            );

            const logOutMessage = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Please confirm`)
              .setDescription(
                `Are you sure you want to log out of this account (${userData.userName})?\n\n⚠️ The account log-in cooldown will **not** be removed if you logout ⚠️`
              )
              .setColor(colours.DEFAULT)
              .setTimestamp();

            const confirmDenyButtons = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId(`confirmLogout`)
                .setEmoji(emojis.ERROR)
                .setStyle("DANGER")
                .setLabel(`Logout`),
              new MessageButton()
                .setCustomId(`denyLogout`)
                .setEmoji(emojis.VERIFY)
                .setStyle("SUCCESS")
                .setLabel(`Cancel`)
            ]);

            await interaction.reply({
              embeds: [logOutMessage],
              components: [confirmDenyButtons],
              ephemeral: true
            });

            const confirmDenyButtonsD = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId(`confirmLogoutD`)
                .setEmoji(emojis.ERROR)
                .setDisabled(true)
                .setStyle("DANGER")
                .setLabel(`Logout`),
              new MessageButton()
                .setCustomId(`denyLogoutD`)
                .setEmoji(emojis.VERIFY)
                .setDisabled(true)
                .setStyle("SUCCESS")
                .setLabel(`Cancel`)
            ]);
            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              const userDecline = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Success`)
                .setDescription(`Cancelled user logout`)
                .setColor(colours.DEFAULT)
                .setTimestamp();

              const logBackdate = `<t:${Math.floor(
                userData.lastTransfer / 1000 + 3 * 7 * 24 * 60 * 60
              )}:f>`;

              const userAccept = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Success`)
                .setDescription(
                  `Successfully logged out of ${userData.userName}\n\nLogin cooldown resets: ${logBackdate}`
                )
                .setColor(colours.DEFAULT)
                .setTimestamp();

              if (i.customId === "denyLogout") {
                await collector.stop();
                return interaction.editReply({
                  embeds: [userDecline],
                  ephemeral: true
                });
              } else if (i.customId === "confirmLogout") {
                const userLogout = new MessageEmbed()
                  .setTitle(`DunkelLuz Logout`)
                  .setColor(colours.DEFAULT)
                  .addFields({
                    name: "Old Owner:",
                    value: `${userData.userId}`
                  })
                  .setTimestamp();

                if (logsChannel)
                  await logsChannel.send({
                    embeds: [userLogout]
                  });

                await collector.stop();
                await userData.updateOne({
                  userId: null
                });
                return interaction.editReply({
                  embeds: [userAccept],
                  ephemeral: true
                });
              }
            });

            collector.on("end", async (i) => {
              return interaction.editReply({
                components: [confirmDenyButtonsD]
              });
            });
          }
        },
        update: {
          description: "Update your account credentials",
          args: [
            {
              name: "password",
              description: "Your account's current password",
              type: "STRING",
              required: true
            },
            {
              name: "new-username",
              description: "Your account's new username [Costs 10 DunkelCoins]",
              type: "STRING",
              minLength: 6,
              maxLength: 16
            },
            {
              name: "new-password",
              description: "Your account's new password",
              type: "STRING",
              minLength: 8,
              maxLength: 32
            },
            {
              name: "private-profile",
              description: "If true only you can check your player stats",
              type: "BOOLEAN"
            }
          ],
          execute: async ({ client, interaction }) => {
            const userData = await userSchema.findOne({
              userId: interaction.user.id
            });

            const noAccount = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot do that`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `You do not have a DunkelLuz account linked to this Discord account, you can create one for free using \`/account login\` or log into an existing account using the same command.`
              )
              .setFooter({
                text: `GBF Security and Safety`
              })
              .setTimestamp();

            if (!userData)
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            const currentPassword = interaction.options.getString("password");
            const newUsername = interaction.options.getString("new-username");
            const newPassword = interaction.options.getString("new-password");
            const privateProfileChoice =
              interaction.options.getBoolean("private-profile");

            const logsChannel = await client.channels.fetch(
              "1022678984166739998"
            );

            const badPassword = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The password you entered does not match this accounts password, if you need help you can use the \`/account reset\` command`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (userData.accountPassword !== currentPassword)
              return interaction.reply({
                embeds: [badPassword],
                ephemeral: true
              });

            const noOptionChosen = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `You must choose either a new username (\`new-username\`), new password (\`new-password\`) or both`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            const cooldownTimer =
              Date.parse(userData.lastUsernameChange) +
              4 * 7 * 24 * 60 * 60 * 1000;

            const onCooldown = new MessageEmbed()
              .setTitle(`${emojis.ERROR} Not Yet!`)
              .setDescription(
                `You cannot change your username until **<t:${Math.floor(
                  userData.lastTransfer / 1000 + 4 * 7 * 24 * 60 * 60
                )}:f>**\n\nDefault cooldown is **4 weeks**`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (cooldownTimer > Date.now() && newUsername)
              return interaction.reply({
                embeds: [onCooldown],
                ephemeral: true
              });

            if (!newUsername && !newPassword)
              return interaction.reply({
                embeds: [noOptionChosen],
                ephemeral: true
              });

            const sameUsername = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The username you entered matches the current account username, please change it.`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (newUsername && newUsername === userData.userName)
              return interaction.reply({
                embeds: [sameUsername],
                ephemeral: true
              });

            const samePassword = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The password you entered matches the current account password.\n\n**Warning:**\nThe \`password\` option is your current account password, we use it to verify it's you, the \`new-password\` option is the password that you want to change to.`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (newPassword && newPassword === userData.accountPassword)
              return interaction.reply({
                embeds: [samePassword],
                ephemeral: true
              });

            if (newUsername) {
              const existingNickName = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Dupe protection`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The name provided (${newUsername}) is already in use, please choose another name.`
                )
                .setFooter({
                  text: `GBF Security`
                })
                .setTimestamp();

              const checkName = await userSchema.find({
                userName: newUsername
              });

              if (checkName.length > 0)
                return interaction.reply({
                  embeds: [existingNickName],
                  ephemeral: true
                });

              const badUsername = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(
                  `The username entered has been flagged by our system as inappropriate, please choose another name.`
                )
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Security and safety | If you think this is a mistake please contact support`
                })
                .setTimestamp();

              if (hasProfanity(newUsername))
                return interaction.reply({
                  embeds: [badUsername],
                  ephemeral: true
                });
            }

            const noFunds = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `You do not have the sufficient funds to complete this transaction: \`Change username\`\n\nRequired: 10 DunkelCoins\nAvailable: ${userData.DunkelCoins} DunkelCoins`
              )
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `Changing your username costs 10 DunkelCoins while changing your password is free`
              })
              .setTimestamp();

            if (userData.DunkelCoins < 10 && newUsername)
              return interaction.reply({
                embeds: [noFunds],
                ephemeral: true
              });

            if (newPassword) {
              const weakPassword = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Too weak!`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The password entered (\`${newPassword}\`) is too weak, you must add at least one of each:\n• 2 Uppercase characters\n• 3 Lowercase characters\n• 2 Numbers`
                )
                .setFooter({
                  text: `GBF Security`
                })
                .setTimestamp();

              const checkPasswordStrength =
                /(?=.*[A-Z].*[A-Z])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}/gi;

              if (!checkPasswordStrength.test(newPassword))
                return interaction.reply({
                  embeds: [weakPassword],
                  ephemeral: true
                });

              const noSpace = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`Your password cannot contain a space`)
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Security and safety | If you think this is a mistake please contact support`
                })
                .setTimestamp();

              function hasWhiteSpace(password) {
                return /\s/g.test(password);
              }

              if (hasWhiteSpace(newPassword))
                return interaction.reply({
                  embeds: [noSpace],
                  ephemeral: true
                });
            }

            const matchingCreds = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot do that`)
              .setDescription(
                `Your account name and password cannot be the same!`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (newUsername && newPassword && newUsername === newPassword)
              return interaction.reply({
                embeds: [matchingCreds],
                ephemeral: true
              });

            const confrimMessage = new MessageEmbed()
              .setTitle(`Please confirm these new settings`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `**Username change costs 10 DunkelCoins <:dunkelCoin:979488319467573338>**\n\n` +
                  `${
                    newUsername
                      ? "New username: " + newUsername
                      : "No username change"
                  }\n${
                    newPassword
                      ? "New password: " + newPassword
                      : "No password change"
                  }\n\n**⚠️ Warning:**\nYou can only change your username once every **4 weeks**`
              )
              .setTimestamp();

            const changeButtons = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId(`confirmChange`)
                .setStyle("SUCCESS")
                .setEmoji(emojis.VERIFY)
                .setLabel(`Confirm`),
              new MessageButton()
                .setCustomId(`denyChange`)
                .setStyle("DANGER")
                .setEmoji(emojis.ERROR)
                .setLabel(`Cancel`)
            ]);

            const changeButtonsD = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId(`confirmChanged`)
                .setDisabled(true)
                .setStyle("SUCCESS")
                .setEmoji(emojis.VERIFY)
                .setLabel(`Confirm`),
              new MessageButton()
                .setCustomId(`denyChanged`)
                .setStyle("DANGER")
                .setDisabled(true)
                .setEmoji(emojis.ERROR)
                .setLabel(`Cancel`)
            ]);

            await interaction.reply({
              embeds: [confrimMessage],
              components: [changeButtons],
              ephemeral: true
            });

            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              const deniedChange = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Success`)
                .setColor(colours.DEFAULT)
                .setDescription(`Changes denied`)
                .setTimestamp();

              const newChanges = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Success`)
                .setColor(colours.DEFAULT)
                .setDescription(
                  `Changes saved\n\n${
                    newUsername
                      ? "New username: " + newUsername
                      : "No username change"
                  }\n${
                    newPassword
                      ? "New password: " + newPassword
                      : "No password change"
                  }`
                )
                .setTimestamp();

              if (i.customId === "denyChange") {
                await collector.stop();
                return interaction.editReply({
                  embeds: [deniedChange]
                });
              }
              if (i.customId === "confirmChange") {
                const userUpdate = new MessageEmbed()
                  .setTitle(`DunkelLuz Account Update`)
                  .setColor(colours.DEFAULT)
                  .setTimestamp()
                  .addFields(
                    {
                      name: "Account ID:",
                      value: `${userData.userId}`
                    },
                    {
                      name: "Old Username:",
                      value: `${userData.userName}`
                    },
                    {
                      name: "New Username:",
                      value: `${
                        newUsername ? newUsername : "No username change"
                      }`
                    },
                    {
                      name: "Old Password:",
                      value: `${userData.accountPassword}`
                    },
                    {
                      name: "New Password:",
                      value: `${
                        newPassword ? newPassword : "No password change"
                      }`
                    },
                    {
                      name: "Private Profile:",
                      value: `${
                        privateProfileChoice
                          ? capitalize(privateProfileChoice.toString())
                          : "No choice chosen"
                      }`
                    }
                  );

                if (logsChannel)
                  await logsChannel.send({
                    embeds: [userUpdate]
                  });

                await userData.updateOne({
                  userName: newUsername ? newUsername : userData.userName,
                  userNameInsensitive: newUsername
                    ? newUsername.toLowerCase()
                    : userData.userNameInsensitive,
                  accountPassword: newPassword
                    ? newPassword
                    : userData.accountPassword,
                  DunkelCoins: newUsername
                    ? userData.DunkelCoins - 10
                    : userData.DunkelCoins,
                  lastUsernameChange: newUsername
                    ? new Date(Date.now())
                    : userData.lastUsernameChange,
                  privateProfile: privateProfileChoice
                    ? privateProfileChoice
                    : userData.privateProfile
                });

                await collector.stop();

                return interaction.editReply({
                  embeds: [newChanges]
                });
              }
            });

            collector.on("end", async (i) => {
              return interaction.editReply({
                components: [changeButtonsD]
              });
            });
          }
        },
        reset: {
          description: "If you forgot your account's details, use this command",
          args: [
            {
              name: "username",
              description: "The account's username",
              type: "STRING"
            },
            {
              name: "discord-id",
              description:
                "The ID of the discord account that's linked to the DunkelLuz account",
              type: "STRING"
            }
          ],
          execute: async ({ client, interaction }) => {
            const accountUsername = interaction.options.getString("username");
            const accountID = interaction.options.getString("discord-id");

            const optionRequired = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `You must specify at least one verification method.`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (!accountUsername && !accountID)
              return interaction.reply({
                embeds: [optionRequired],
                ephemeral: true
              });

            let userData;
            if (accountID)
              userData = await userSchema.findOne({
                userId: accountID
              });
            else
              userData = await userSchema.findOne({
                userNameInsensitive: accountUsername.toLowerCase()
              });

            const noData = new MessageEmbed()
              .setTitle(`${emojis.ERROR} Process cancelled`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I can't find an account with the details you input\n\n${
                  accountID ? accountID : ""
                } ${accountUsername ? accountUsername : ""}`
              )
              .setTimestamp();

            if (!userData)
              return interaction.reply({
                embeds: [noData],
                ephemeral: true
              });

            const notFound = new MesageEmbed()
              .setTitle(`${emojis.ERROR} I ran into an error`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I couldn't find the discord account linked to this DunkelLuz account, please contact support for more help using \`/bot invite\` and choosing support server.`
              );

            const originalOwner = await client.users.fetch(userData.userId);

            if (!originalOwner)
              return interaction.reply({
                embeds: [notFound],
                ephemeral: true
              });

            const logsChannel = await client.channels.fetch(
              "1022678984166739998"
            );

            const unableToDm = new MessageEmbed()
              .setTitle(`${emojis.ERROR} I ran into an error!`)
              .setDescription(
                `I couldn't DM the discord account associated with the provided DunkelLuz account, please contact support if you'd like further assistance using \`/bot invite\` then choosing support server.`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            const in5minutes = Math.floor((Date.now() + 5 * 60 * 1000) / 1000);

            const codeSent = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Success`)
              .setDescription(
                `I've sent the verification code to the discord account associated with the provided DunkelLuz account, send the code in this channel.\n\nActive for **5 minutes** (<t:${in5minutes}:R>)`
              )
              .setColor(colours.DEFAULT)
              .setTimestamp();

            await interaction.reply({
              embeds: [codeSent],
              ephemeral: true
            });

            const possible =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&()+";
            let verificationCode = ``;

            for (let i = 0; i < 15; i++)
              verificationCode += `${possible.charAt(
                Math.floor(Math.random() * possible.length)
              )}`;

            try {
              await originalOwner.send({
                content: `Here's your verification code:\n${verificationCode}\nCode will be active for 5 minutes (<t:${in5minutes}:R>)\n\nIf you did not initate this then please ignore this and change your password.\nReset started by: ${
                  interaction.user.tag
                } : [${interaction.user.id}] at <t:${Math.round(
                  Date.now() / 1000
                )}:F>`
              });
            } catch (err) {
              return interaction.reply({
                embeds: [unableToDm],
                ephemeral: true
              });
            }

            const successEmbed = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Confirmed`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `Successfully verified!\n\nAccount details:\n• Username: ${userData.userName}\n• Password: ${userData.accountPassword}`
              )
              .setTimestamp();

            const failedEmbed = new MessageEmbed()
              .setTitle(`${emojis.ERROR} Failed`)
              .setColor(colours.DEFAULT)
              .setDescription(`Failed to verify account ownership`)
              .setTimestamp();

            let loginAttempts = 1;

            const collector = await interaction.channel.createMessageCollector({
              time: 30000
            });

            const resetAccount = new MessageEmbed()
              .setTitle(`DunkelLuz Account Reset`)
              .setColor(colours.DEFAULT)
              .addFields(
                {
                  name: "Owner:",
                  value: `${userData.userId}`
                },
                {
                  name: "Reset By:",
                  value: `${interaction.user.id}`
                }
              );

            collector.on("collect", async (m) => {
              if (m.author.id === interaction.user.id) {
                if (m.content === verificationCode) {
                  await collector.stop();
                  await m.delete();
                  if (logsChannel)
                    await logsChannel.send({
                      embeds: [resetAccount]
                    });
                  await interaction.followUp({
                    content: `Success! Please check the original message`,
                    ephemeral: true
                  });
                  return interaction.editReply({
                    embeds: [successEmbed]
                  });
                } else {
                  if (loginAttempts !== 3) {
                    await interaction.followUp({
                      content: `The code you entered does not match!\nAttempts remaining: ${
                        3 - loginAttempts
                      }`,
                      ephemeral: true
                    });
                    loginAttempts++;
                    await m.react(emojis.ERROR);
                  } else {
                    await collector.stop();
                    await interaction.followUp({
                      content: `No more attempts remaining.`,
                      ephemeral: true
                    });
                    return interaction.editReply({
                      embeds: [failedEmbed],
                      ephemeral: true
                    });
                  }
                }
              }
            });
          }
        }
      }
    });
  }
};
