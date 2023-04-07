const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const SlashCommand = require("../../utils/slashCommands");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");
const title = require("../../gbfembedmessages.json");

const FreebieProfileSchema = require("../../schemas/Freebie Schemas/Server Profile Schema.js");
const FreebieRegisterSchema = require("../../schemas/Freebie Schemas/Pending Registry Schema.js");
const FreebieUsesSchema = require("../../schemas/Freebie Schemas/Freebie Profiles Schema");

const { capitalize, delay } = require("../../utils/engine");

const { green, redBright } = require("chalk");

const admin = require("../../Freebie Settings/IDs.json");

const invitelink = `https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642824461751&scope=bot%20applications.commands`;
const topgg = `https://top.gg/bot/795361755223556116/vote`;

const {
  commandLocked,
  invalidKey,
  ControlPanel,
  EpicGamesEmbed,
  oneGameDisplay,
  controlPanelFirstRow,
  controlPanelSecondRow,
  confirmOrDenyD,
  twoGamesDisplay,
  threeGamesDisplay,
  EpicGamesRow,
  ForceExit,
  controlPanelFirstRowD,
  controlPanelSecondRowD,
  SteamEmbed,
  oneSteamGameDisplay,
  twoSteamGamesDisplay,
  threeSteamGamesDisplay,
  SteamRow,
  GOGEmbed,
  oneGameGOGDisplay,
  twoGamesGOGDisplay,
  threeGamesGOGDisplay,
  GOGRow,
  PRIMEEmbed,
  oneGamePRIMEDisplay,
  twoGamePRIMEDisplay,
  threeGamePRIMEDisplay,
  PRIMERow,
  OriginEmbed,
  oneGameORIGINDisplay,
  twoGameORIGINDisplay,
  threeGameORIGINDisplay,
  ORIGINRow,
  UbisoftEmbed,
  oneUBISOFTDisplay,
  twoUBISOFTDisplay,
  threeUBISOFTDisplay,
  UBIRow,
} = require("../../Freebie Settings/freebieSenderEmbeds");

module.exports = class FreebieCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "freebie",
      description: "GBF Freebie commands",
      category: "Utility",
      userPermission: ["ADMINISTRATOR"],
      botPermission: ["SEND_MESSAGES", "EMBED_LINKS"],
      cooldown: 5,
      development: false,
      partner: false,
      subcommands: {
        register: {
          description: "Sign your server up for GBF Freebie services",
          args: [
            {
              name: "channel",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
              description: `The channel to send the freebies to`,
              required: true,
            },
            {
              name: "ping",
              type: "BOOLEAN",
              description: `Choose whether to ping a role when a freebie is given`,
              required: true,
            },
            {
              name: "auto",
              type: "BOOLEAN",
              description: `Enable automatic setup of GBF Freebies for this server [Check documentation for more info]`,
              required: true,
            },
            {
              name: "role",
              type: "ROLE",
              description: `The role to ping when a freebie is given`,
              required: false,
            },
            {
              name: "color",
              type: "STRING",
              description: `The color of the freebie embed || Format: #RRGGBB`,
              required: false,
            },
          ],
          execute: async ({ client, interaction }) => {
            let serverProfileDoc = await FreebieProfileSchema.findOne({
              guildId: interaction.guild.id,
            });

            let serverRegisterDoc = await FreebieRegisterSchema.findOne({
              guildId: interaction.guild.id,
            });

            let freebieUsesDoc = await FreebieUsesSchema.findOne({
              ID: "GBFFreebie",
            });

            const alreadyRegistered = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services || /invite`,
                iconURL: client.user.displayAvatarURL(),
              });

            if (
              serverRegisterDoc ||
              (serverProfileDoc && serverProfileDoc.Enabled === false)
            ) {
              alreadyRegistered.setDescription(
                `${interaction.guild.name} has already registered and approval is pending for GBF Freebie services.`
              );
              return interaction.reply({
                embeds: [alreadyRegistered],
                ephemeral: true,
              });
            } else if (serverProfileDoc && serverProfileDoc.Enabled) {
              alreadyRegistered.setDescription(
                `${interaction.guild.name} is already registered and has been approved for GBF Freebie services.`
              );
              return interaction.reply({
                embeds: [alreadyRegistered],
                ephemeral: true,
              });
            }

            const freebieChannel = interaction.options.getChannel("channel");
            const freebiePing = interaction.options.getBoolean("ping");
            const freebieRole = interaction.options.getRole("role") || null;
            const freebieEmbedColor =
              interaction.options.getString("color") || "#e91e63";
            const freebieAuto = interaction.options.getBoolean("auto");

            if (freebieAuto === false) {
              const roleRequired = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Invalid Arguments`)
                .setDescription(
                  `You must provide a role to ping when a freebie message is sent in ${freebieChannel}\nYou're seeing this message because you set ping to true.\n\n`
                )
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Freebie Services || /invite`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

              if (freebiePing && !freebieRole)
                return interaction.reply({
                  embeds: [roleRequired],
                  ephemeral: true,
                });

              const colorCodeRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

              const InvalidColor = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Oh no`)
                .setDescription(
                  `You can only enter colors in hexadecimal format, I've automatically used **#e91e63** to stop you from re-running this command, you can update the color later using **/freebie update**\nEG.\`#00FF00\` (# must be included) || [Click me](${`https://htmlcolorcodes.com/`}) to check out color codes`
                )
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Freebie Services || /invite`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

              const badChannel = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`You need to specify a \`text\` channel`)
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Freebie Services || Pending Registration`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

              if (freebieChannel.type !== "GUILD_TEXT")
                return interaction.reply({
                  embeds: [badChannel],
                  ephemeral: true,
                });

              const registryID =
                `#` +
                Math.random().toString(36).substring(2, 8) +
                `${Math.round(Math.random() * 5000)}`;

              let newRegistryDoc = new FreebieRegisterSchema({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                Timestamp: new Date(Date.now()),
                Automatic: freebieAuto,
                ID: registryID,
              });

              await newRegistryDoc.save().catch((e) => {
                console.error("Error:", e);
              });

              let displayColor;
              if (colorCodeRegex.test(freebieEmbedColor) === false)
                displayColor = "#e91e63";
              else displayColor = freebieEmbedColor;

              let newProfileDoc = new FreebieProfileSchema({
                guildId: interaction.guild.id,
                Enabled: false,
                Channel: freebieChannel.id,
                Ping: freebiePing,
                rolePing: freebieRole ? freebieRole.id : null,
                embedColor: displayColor,
              });

              await newProfileDoc.save().catch((e) => {
                console.error("Error:", e);
              });

              if (!freebieUsesDoc) {
                let newUsesDoc = new FreebieUsesSchema({
                  ID: "GBFFreebie",
                  Uses: 1,
                });
                await newUsesDoc.save().catch((e) => {
                  console.error("Error:", e);
                });
              } else {
                freebieUsesDoc.Uses += 1;
                await freebieUsesDoc.save().catch((e) => {
                  console.error("Error:", e);
                });
              }

              const pendRegistration = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Sucess`)
                .setDescription(
                  `A request to register **${interaction.guild.name}** for GBF Freebies has been sent to GBF.\nA message will be sent to ${freebieChannel} once a choice is made.\nYou can always change the settings using **/freebie update**\n**Settings:**`
                )
                .addFields(
                  {
                    name: "Channel:",
                    value: `${freebieChannel}`,
                    inline: true,
                  },
                  {
                    name: "Ping:",
                    value: `${freebiePing ? "True" : "False"}`,
                    inline: true,
                  },
                  {
                    name: "Role:",
                    value: `${freebiePing ? freebieRole : "Ping Disabled"}`,
                    inline: true,
                  },
                  {
                    name: "Color:",
                    value: `${displayColor}`,
                    inline: true,
                  },
                  {
                    name: "Registry ID:",
                    value: `${registryID}`,
                    inline: true,
                  },
                  {
                    name: "⚠️ Warning ⚠️",
                    value: `You are recommended to check out the [setup guide](${"https://app.gitbook.com/s/xYNH9aprfyhIRULvKy8v/features-and-guide/setup"}) in order to understand this system, the settings set can be changed using **/freebie update**.\nThe default settings for categories will be used unless changed.`,
                    inline: true,
                  }
                )
                .setColor(displayColor)
                .setURL(
                  "https://app.gitbook.com/s/xYNH9aprfyhIRULvKy8v/features-and-guide/setup"
                )
                .setFooter({
                  text: `GBF Freebie Services || Pending Registration`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

              await interaction.reply({
                embeds: [pendRegistration],
                repliedUser: true,
              });

              if (colorCodeRegex.test(freebieEmbedColor) === false)
                await interaction.followUp({
                  embeds: [InvalidColor],
                });

              return client.emit(
                "freebieRegister",
                interaction.guild,
                freebieChannel,
                freebieAuto
              );
            } else {
              const colorCodeRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

              const InvalidColor = new MessageEmbed()
                .setTitle(`${emojis.ERROR} Oh no`)
                .setDescription(
                  `You can only enter colors in hexadecimal format, I've automatically used **#e91e63** to stop you from re-running this command, you can update the color later using **/freebie update**\nEG.\`#00FF00\` (# must be included) || [Click me](${`https://htmlcolorcodes.com/`}) to check out color codes`
                )
                .setColor(colours.ERRORRED)
                .setFooter({
                  text: `GBF Freebie Services || /invite`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

              let displayColor;
              if (colorCodeRegex.test(freebieEmbedColor) === false)
                displayColor = "#e91e63";
              else displayColor = freebieEmbedColor;

              let newProfileDoc = new FreebieProfileSchema({
                guildId: interaction.guild.id,
                Enabled: false,
                Channel: interaction.channel.id,
                Ping: false,
                rolePing: null,
                embedColor: displayColor,
              });

              await newProfileDoc.save().catch((e) => {
                console.error("Error:", e);
              });

              const registryID =
                `#` +
                Math.random().toString(36).substring(2, 8) +
                `${Math.round(Math.random() * 5000)}`;

              let newRegistryDoc = new FreebieRegisterSchema({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                Timestamp: new Date(Date.now()),
                Automatic: freebieAuto,
                ID: registryID,
              });

              await newRegistryDoc.save().catch((e) => {
                console.error("Error:", e);
              });

              if (!freebieUsesDoc) {
                let newUsesDoc = new FreebieUsesSchema({
                  ID: "GBFFreebie",
                  Uses: 1,
                });
                await newUsesDoc.save().catch((e) => {
                  console.error("Error:", e);
                });
              } else {
                freebieUsesDoc.Uses += 1;
                await freebieUsesDoc.save().catch((e) => {
                  console.error("Error:", e);
                });
              }

              const automaticRegistration = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Sucess`)
                .setDescription(
                  `A request to register **${interaction.guild.name}** for GBF Freebies has been sent to GBF.\nYou've opted in for the automatic setup option, a message will be sent to the **automatic freebies** channel once a choice is made.\n**Settings:**`
                )
                .addFields(
                  {
                    name: "**⚠ Must Know ⚠**",
                    value: `GBF should have **Manage Channels** permissions in order to complete the automatic setup`,
                    inline: true,
                  },
                  {
                    name: "Channel:",
                    value: `Once accepted, GBF will create a channel by the name of **Free Games** with the following permissions:\n- Send Messaged Denied for everyone\n- View Channel Enabled for everyone`,
                    inline: false,
                  },
                  {
                    name: "Ping:",
                    value: `Disabled (Automatic Setup) || Can be enabled using /freebie update`,
                    inline: false,
                  },
                  {
                    name: "Role:",
                    value: `Disabled (Automatic Setup) || Can be enabled using /freebie update`,
                    inline: false,
                  },
                  {
                    name: "Registry ID:",
                    value: `${registryID}`,
                    inline: false,
                  }
                )
                .setColor(displayColor)
                .setURL(
                  "https://app.gitbook.com/s/xYNH9aprfyhIRULvKy8v/features-and-guide/setup"
                )
                .setFooter({
                  text: `GBF Freebie Services || Pending Registration`,
                  iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

              await interaction.reply({
                embeds: [automaticRegistration],
                repliedUser: true,
              });

              if (colorCodeRegex.test(freebieEmbedColor) === false)
                await interaction.followUp({
                  embeds: [InvalidColor],
                });

              return client.emit(
                "freebieRegister",
                interaction.guild,
                interaction.channel,
                freebieAuto
              );
            }
          },
        },
        update: {
          description: "Update the Default Freebie settings for this server",
          args: [
            {
              name: "setting",
              description: "Enable or disable GBF Freebies",
              type: "BOOLEAN",
              required: true,
            },
            {
              name: "channel",
              description:
                "Update the channel that the freebie messages will be sent to",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
            },
            {
              name: "ping",
              description: "Enable or disable the ping feature",
              type: "BOOLEAN",
            },
            {
              name: "role",
              description: "The role that you want to mention",
              type: "ROLE",
            },
          ],
          execute: async ({ client, interaction }) => {
            const settingBool = interaction.options.getBoolean("setting");
            const updatedChannel = interaction.options.getChannel("channel");
            const updatedPing = interaction.options.getBoolean("ping");
            const updatedRole = interaction.options.getRole("role");

            const roleRequired = new MessageEmbed()
              .setTitle(`${emojis.ERROR} Invalid Arguments`)
              .setDescription(
                `You must provide a role to ping when a freebie message is sent\nYou're seeing this message because you set ping to true.\n\n`
              )
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services || /invite`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setTimestamp();

            if (updatedPing && updatedPing === true && !updatedRole)
              return interaction.reply({
                embeds: [roleRequired],
                ephemeral: true,
              });

            let serverProfileDoc = await FreebieProfileSchema.findOne({
              guildId: interaction.guild.id,
            });

            let serverRegisterDoc = await FreebieRegisterSchema.findOne({
              guildId: interaction.guild.id,
            });

            const registerationPending = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `${interaction.guild.name} has already registered and is pending a decision.\nYou can't update the settings until the decision is made.`
              )
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services || /invite`,
                iconURL: client.user.displayAvatarURL(),
              });
            if (serverRegisterDoc)
              return interaction.reply({
                embeds: [registerationPending],
                ephemeral: true,
              });

            const notRegistered = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that yet`)
              .setDescription(
                `${interaction.guild.name} has not registered for GBF Freebies yet.\nRegister using /freebie register`
              )
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services || Please read the documentation to know how to setup GBF Freebies`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setTimestamp();

            if (!serverProfileDoc)
              return interaction.reply({
                embeds: [notRegistered],
                ephemeral: true,
              });

            let moduleBool;

            if (settingBool === false || settingBool === true)
              moduleBool = settingBool;
            else moduleBool = serverProfileDoc.Enabled;

            let moduleChannel;

            if (updatedChannel) moduleChannel = updatedChannel;
            else moduleChannel = serverProfileDoc.Channel;

            let modulePing;

            if (updatedPing === false || updatedPing === true)
              modulePing = updatedPing;
            else modulePing = serverProfileDoc.Ping;

            let moduleRole;

            if (updatedRole) moduleRole = updatedRole;
            else moduleRole = serverProfileDoc.rolePing;

            const updatedModuleSettings = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Settings Saved!`)
              .setDescription(
                `If you'd like to update the cosmetic settings use /freebie cosmetic`
              )
              .setColor(colours.DEFAULT)
              .addFields({
                name: "Module Enabled:",
                value: `${capitalize(moduleBool.toString())}`,
              });

            if (updatedChannel)
              updatedModuleSettings.addFields({
                name: "Updated Channel:",
                value: `${moduleChannel}`,
              });

            if (updatedPing === false || updatedPing === true)
              updatedModuleSettings.addFields({
                name: "Updated Ping:",
                value: `${capitalize(modulePing.toString())}`,
              });

            if (updatedPing === false && updatedRole)
              updatedModuleSettings.addFields({
                name: "Updated Role:",
                value: `Ping Disabled || Role: ${moduleRole}`,
              });

            if (updatedPing === true && updatedRole)
              updatedModuleSettings.addFields({
                name: "Updated Role:",
                value: `${moduleRole}`,
              });

            await interaction.reply({
              embeds: [updatedModuleSettings],
            });

            return serverProfileDoc.updateOne({
              Enabled: moduleBool,
              Channel: moduleChannel,
              Ping: modulePing,
              rolePing: moduleRole,
            });
          },
        },
        category: {
          description: "Customize the settings for each category",
          args: [
            {
              name: "use-default",
              description:
                "Will use the GBF Freebies Default Settings || Read the docs or check the guide for more information",
              type: "BOOLEAN",
              required: true,
            },
            {
              name: "epic-games-ping",
              description: "Setup the mention for the Epic Games category",
              type: "ROLE",
              required: false,
            },
            {
              name: "epic-games-channel",
              description: "Setup the channel for the Epic Games category",
              channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
              type: "CHANNEL",
            },
            {
              name: "steam-ping",
              description: "Setup the mention for the Steam category",
              type: "ROLE",
            },
            {
              name: "steam-channel",
              description: "Setup the channel for the Steam category",
              channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
              type: "CHANNEL",
            },
            {
              name: "other-ping",
              description: "Setup the mention for the Other category",
              type: "ROLE",
            },
            {
              name: "other-channel",
              description: "Setup the channel for the Other category",
              channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
              type: "CHANNEL",
            },
          ],
          execute: async ({ client, interaction }) => {
            const useDefault = interaction.options.getBoolean("use-default");
            const epicPing = interaction.options.getRole("epic-games-ping");
            const epicChannel =
              interaction.options.getChannel("epic-games-channel");
            const steamPing = interaction.options.getRole("steam-ping");
            const steamChannel =
              interaction.options.getChannel("steam-channel");
            const otherPing = interaction.options.getRole("other-ping");
            const otherChannel =
              interaction.options.getChannel("other-channel");

            const serverDoc = await FreebieProfileSchema.findOne({
              guildId: interaction.guild.id,
            });

            const notRegistered = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that yet`)
              .setDescription(
                `${interaction.guild.name} has not registered for GBF Freebies yet.\nRegister using /freebie register`
              )
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services || Please read the documentation to know how to setup GBF Freebies`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setTimestamp();

            if (!serverDoc)
              return interaction.reply({
                embeds: [notRegistered],
                ephemeral: true,
              });

            const noOptionChosen = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(`Please provide atleast **one** option`)
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services || Please read the documentation to know how to setup GBF Freebies`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setTimestamp();

            let categorySetting = 0;

            if (
              !useDefault &&
              !epicPing &&
              !epicChannel &&
              !steamPing &&
              !steamChannel &&
              !otherPing &&
              !otherChannel
            )
              return interaction.reply({
                embeds: [noOptionChosen],
                ephemeral: true,
              });

            const updatedCategorySettings = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Settings Saved`)
              .setColor(colours.DEFAULT)
              .setTimestamp()
              .setFooter({
                text: `GBF Freebie Services || Please read the documentation to know how to setup GBF Freebies`,
                iconURL: client.user.displayAvatarURL(),
              });

            if (epicChannel) categorySetting += 1;
            if (steamChannel) categorySetting += 2;
            if (otherChannel) categorySetting += 4;
            if (useDefault) categorySetting = 0;

            if (serverDoc.useDefault !== useDefault)
              updatedCategorySettings.addFields({
                name: "Default Setting Value:",
                value: `${capitalize(useDefault.toString())}`,
              });

            //Taken from old code and too lazy to update tbh

            if (epicPing)
              updatedCategorySettings.addFields({
                name: "Epic Games Ping:",
                value: `${epicPing}`,
              });

            if (epicChannel)
              updatedCategorySettings.addFields({
                name: "Epic Games Channel:",
                value: `${epicChannel}`,
              });

            if (steamPing)
              updatedCategorySettings.addFields({
                name: "Steam Ping:",
                value: `${steamPing}`,
              });

            if (steamChannel)
              updatedCategorySettings.addFields({
                name: "Steam Channel:",
                value: `${steamChannel}`,
              });

            if (otherPing)
              updatedCategorySettings.addFields({
                name: "Other Ping:",
                value: `${otherPing}`,
              });

            if (otherChannel)
              updatedCategorySettings.addFields({
                name: "Other Channel:",
                value: `${otherChannel}`,
              });

            await serverDoc.updateOne({
              useDefault: useDefault,
              activeCategory: categorySetting
                ? categorySetting
                : serverDoc.activeCategory,
              useDefault: useDefault,
              EGSPing: epicPing ? epicPing : serverDoc.EGSPing,
              EGSChannel: epicChannel ? epicChannel : serverDoc.EGSChannel,
              SteamPing: steamPing ? steamPing : serverDoc.SteamPing,
              SteamChannel: steamChannel
                ? steamChannel
                : serverDoc.SteamChannel,
              OtherChannel: otherChannel
                ? otherChannel
                : serverDoc.OtherChannel,
              OtherPing: otherPing ? otherPing : serverDoc.OtherPing,
            });

            return interaction.reply({
              embeds: [updatedCategorySettings],
            });
          },
        },
        cosmetic: {
          description:
            "Customize the embed and messages for the freebie message",
          args: [
            {
              name: "default",
              description:
                "Will reset all of the cosmetic settings and will ignore the new settings set here",
              type: "BOOLEAN",
              required: true,
            },
            {
              name: "embed-color",
              description: "Change the color of the embed",
              type: "STRING",
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            const resetSettings = interaction.options.getBoolean("default");

            const serverDoc = await FreebieProfileSchema.findOne({
              guildId: interaction.guild.id,
            });

            const notRegistered = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that yet`)
              .setDescription(
                `${interaction.guild.name} has not registered for GBF Freebies yet.\nRegister using /freebie register`
              )
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services || Please read the documentation to know how to setup GBF Freebies`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setTimestamp();

            if (!serverDoc)
              return interaction.reply({
                embeds: [notRegistered],
                ephemeral: true,
              });

            if (resetSettings) {
              await serverDoc.updateOne({
                embedColor: colours.DEFAULT,
              });

              const settingsReset = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Settings Saved`)
                .setDescription(
                  `GBF Freebies Cosmetic Settings have been reset`
                )
                .addFields({
                  name: "Embed Color:",
                  value: `${colours.DEFAULT}`,
                })
                .setColor(colours.DEFAULT)
                .setFooter({
                  text: `Category settings have not been changed`,
                })
                .setTimestamp();

              return interaction.reply({
                embeds: [settingsReset],
              });
            }

            let embedColor = interaction.options.getString("embed-color");

            const colorCodeRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

            const invalidColor = new MessageEmbed()
              .setTitle(`${emojis.ERROR} Invalid Input`)
              .setDescription(
                `The color provided [${embedColor}] has been registered as an invalid color by our system\nPlease make sure it fits the [HTML Color Code format](${`https://htmlcolorcodes.com/`}): \`#RRGGBB\``
              )
              .setColor(colours.ERRORRED)
              .setFooter({
                text: `GBF Freebie Services`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setTimestamp();

            if (embedColor && !embedColor.includes("#"))
              embedColor += `#${embedColor}`;

            if (embedColor && colorCodeRegex.test(embedColor) === false)
              return interaction.reply({
                embeds: [invalidColor],
                ephemeral: true,
              });

            await serverDoc.updateOne({
              embedColor: embedColor ? embedColor : serverDoc.embedColor,
            });

            let text;
            if (checkPremium)
              text = `Thank you for supporting GBF! ${emojis.MUNCH}`;
            else
              text = `Want to unlock more cosmetic features? Join GBF Premium or become a partner today ${emojis.TRACER}`;

            const settingsSaved = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Settings Saved!`)
              .setDescription(
                `To view what an example embed will look like run \`/freebie example\`\n${text}`
              )
              .setColor(colours.DEFAULT)
              .setFooter({
                text: `GBF Freebie Services || Customization`,
                iconURL: client.user.displayAvatarURL(),
              })
              .setTimestamp();

            return interaction.reply({
              embeds: [settingsSaved],
            });
          },
        },
        opt: {
          description: "[Developer] Change a server premium or partner perks",
          args: [
            {
              name: "server",
              description: "The server that you want to change the perks of",
              type: "STRING",
              required: true,
            },
            {
              name: "type",
              description: "The type of subscription",
              type: "STRING",
              choices: [
                {
                  name: "Premium",
                  value: "Premium",
                },
                {
                  name: "Partner",
                  value: "Partner",
                },
              ],
              required: true,
            },
            {
              name: "option",
              description: "Choose whether to add or remove the perks",
              type: "STRING",
              choices: [
                {
                  name: "Add",
                  value: "true",
                },
                {
                  name: "Remove",
                  value: "false",
                },
              ],
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            if (interaction.user.id !== "333644367539470337")
              return interaction.reply({
                content: `This is a developer only command and you don't look like one\nWho even are you 👁👄👁`,
                ephemeral: true,
              });

            const serverId = interaction.options.getString("server");
            const changeType = interaction.options.getString("type");
            const addOrRemove = interaction.options.getString("option");

            let premiumOption;
            let partnerOption;

            let serverDoc = await FreebieProfileSchema.findOne({
              guildId: serverId,
            });

            if (!serverDoc)
              return interaction.reply({
                content: `I couldn't find data on the provided server.`,
                ephemeral: true,
              });

            if (addOrRemove === "false") {
              if (changeType === "Premium") premiumOption = false;
              else premiumOption = serverDoc.Premium;
              if (changeType === "Partner") partnerOption = false;
              else partnerOption = serverDoc.Partner;
            } else {
              if (changeType === "Premium") premiumOption = true;
              else premiumOption = serverDoc.Premium;
              if (changeType === "Partner") partnerOption = true;
              else partnerOption = serverDoc.Partner;
            }

            await serverDoc.updateOne({
              Premium: premiumOption,
              Partner: partnerOption,
            });

            return interaction.reply({
              content: `${emojis.VERIFY} Data Saved!`,
              ephemeral: true,
            });
          },
        },
        example: {
          description: "Example of how the freebie message will look",
          execute: async ({ client, interaction }) => {
            const serverData = await FreebieProfileSchema.findOne({
              guildId: interaction.guild.id,
            });

            const noDataEmbed = new MessageEmbed()
              .setTitle(`${emojis.ERROR} Not Yet!`)
              .setDescription(
                `${interaction.guild.name} has not registered as a freebie server yet.\n\nUse \`/freebie register\` to register as a freebie server.`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp()
              .setFooter({
                text: `GBF Freebie Services`,
                iconURL: client.user.displayAvatarURL(),
              });

            if (!serverData)
              return interaction.reply({
                embeds: [noDataEmbed],
                ephemeral: true,
              });

            let premiumBool;

            if (serverData.Premium === true || serverData.Partner === true)
              premiumBool = true;
            else premiumBool = false;

            const freebieExampleEmbed = new MessageEmbed()
              .setTitle(
                `${emojis.BREAKDANCE} Freebie Message Example ${emojis.TRACER}`
              )
              .setColor(serverData.embedColor)
              .setDescription(`Number of free games go here`)
              .addFields({
                name: "Game Information go here",
                value: "Game Links go here",
              })
              .setFooter({
                text: `GBF is not affiliated with {company}, This message was posted by {poster}`,
              });

            await interaction.reply({
              content: `Sending example embed...`,
              ephemeral: true,
            });

            await interaction.channel.send({
              embeds: [freebieExampleEmbed],
            });
          },
        },
        send: {
          description: "[Developer] Send the freebie message",
          execute: async ({ client, interaction }) => {
            if (
              interaction.guild.id !== admin.GBF &&
              interaction.guild.id !== admin.Monke &&
              interaction.user.id !== admin.Bunnys &&
              interaction.user.id !== admin.Angel &&
              interaction.channel.id !== admin.codingChannel &&
              interaction.channel.id !== admin.freebieSendChannel
            )
              return interaction.reply({
                embeds: [commandLocked],
                ephemeral: true,
              });

            commandLocked.setFooter({
              text: `GBF Freebie Security || GBF`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            invalidKey.setFooter({
              text: `GBF Freebie Security || GBF`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            ControlPanel.setFooter({
              text: `GBF Freebies || GBF`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            EpicGamesEmbed.setFooter({
              text: `GBF Freebies || Epic Games`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            oneGameDisplay.setFooter({
              text: `GBF Freebies || Epic Games`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            twoGamesDisplay.setFooter({
              text: `GBF Freebies || Epic Games`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            threeGamesDisplay.setFooter({
              text: `GBF Freebies || Epic Games`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            SteamEmbed.setFooter({
              text: `GBF Freebies || Steam`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            oneSteamGameDisplay.setFooter({
              text: `GBF Freebies || Steam`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            twoSteamGamesDisplay.setFooter({
              text: `GBF Freebies || Steam`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            threeSteamGamesDisplay.setFooter({
              text: `GBF Freebies || Steam`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            GOGEmbed.setFooter({
              text: `GBF Freebies || GOG`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            oneGameGOGDisplay.setFooter({
              text: `GBF Freebies || GOG`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            twoGamesGOGDisplay.setFooter({
              text: `GBF Freebies || GOG`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            threeGamesGOGDisplay.setFooter({
              text: `GBF Freebies || GOG`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            PRIMEEmbed.setFooter({
              text: `GBF Freebies || Prime Gaming`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            oneGamePRIMEDisplay.setFooter({
              text: `GBF Freebies || Prime Gaming`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            twoGamePRIMEDisplay.setFooter({
              text: `GBF Freebies || Prime Gaming`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            threeGamePRIMEDisplay.setFooter({
              text: `GBF Freebies || Prime Gaming`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            OriginEmbed.setFooter({
              text: `GBF Freebies || Origin/EA`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            oneGameORIGINDisplay.setFooter({
              text: `GBF Freebies || Origin/EA`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            twoGameORIGINDisplay.setFooter({
              text: `GBF Freebies || Origin/EA`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            threeGameORIGINDisplay.setFooter({
              text: `GBF Freebies || Origin/EA`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            UbisoftEmbed.setFooter({
              text: `GBF Freebies || Ubisoft`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            oneUBISOFTDisplay.setFooter({
              text: `GBF Freebies || Ubisoft`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            twoUBISOFTDisplay.setFooter({
              text: `GBF Freebies || Ubisoft`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            threeUBISOFTDisplay.setFooter({
              text: `GBF Freebies || Ubisoft`,
              iconURL: interaction.user.displayAvatarURL(),
            });

            await interaction.reply({
              content: `Panel launched by ${interaction.user.tag}`,
              embeds: [ControlPanel],
              components: [controlPanelFirstRow, controlPanelSecondRow],
            });

            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000,
              });

            console.log(
              redBright(
                `${interaction.user.tag} has launched the Freebie Control Panel in ${interaction.guild.name}, ${interaction.channel.name}`
              )
            );

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "Exit" || i.customId === "quit") {
                await collector.stop();
                return interaction.editReply({
                  content: `GBF Freebie Panel has been forcefully closed.`,
                });
              }

              if (i.customId === "goBack")
                await interaction.editReply({
                  embeds: [ControlPanel],
                  components: [controlPanelFirstRow, controlPanelSecondRow],
                });

              if (i.customId === "EGS")
                await interaction.editReply({
                  embeds: [EpicGamesEmbed],
                  components: [EpicGamesRow, ForceExit],
                });

              if (i.customId === "firstGameEG") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmOneEGS`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyOneEGS`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [oneGameDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmOneEGS") {
                oneGameDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [oneGameDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "EPIC", 1, interaction.user);
              } else if (i.customId === "denyOneEGS") {
                oneGameDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [oneGameDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "secondGameEG") {
                const confirmOrDenyTwoEGS = new MessageActionRow();
                confirmOrDenyTwoEGS.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmTwoEGS`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDenyTwoEGS.addComponents(
                  new MessageButton()
                    .setCustomId(`denyTwoEGS`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [twoGamesDisplay],
                  components: [confirmOrDenyTwoEGS, ForceExit],
                });
              } else if (i.customId === "confirmTwoEGS") {
                twoGamesDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [twoGamesDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "EPIC", 2, interaction.user);
              } else if (i.customId === "denyTwoEGS") {
                twoGamesDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [twoGamesDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "thirdGameEG") {
                const confirmOrDenyThreeEGS = new MessageActionRow();
                confirmOrDenyThreeEGS.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmThreeEGS`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDenyThreeEGS.addComponents(
                  new MessageButton()
                    .setCustomId(`denyThreeEGS`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [threeGamesDisplay],
                  components: [confirmOrDenyThreeEGS, ForceExit],
                });
              } else if (i.customId === "confirmThreeEGS") {
                threeGamesDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [threeGamesDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "EPIC", 3, interaction.user);
              } else if (i.customId === "denyThreeEGS") {
                threeGamesDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [threeGamesDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "STEAM")
                await interaction.editReply({
                  embeds: [SteamEmbed],
                  components: [SteamRow, ForceExit],
                });
              else if (i.customId === "firstGameST") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmOneST`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyOneST`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [oneSteamGameDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmOneST") {
                oneSteamGameDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [oneSteamGameDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "STEAM", 1, interaction.user);
              } else if (i.customId === "denyOneST") {
                oneSteamGameDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [oneSteamGameDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "secondGameST") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmTwoST`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyTwoST`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [twoSteamGamesDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmTwoST") {
                twoSteamGamesDisplay.setTitle(
                  `${emojis.VERIFY} Send Confirmed`
                );
                await collector.stop();
                await interaction.editReply({
                  embeds: [twoSteamGamesDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "STEAM", 2, interaction.user);
              } else if (i.customId === "denyTwoST") {
                twoSteamGamesDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [twoSteamGamesDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "thirdGameST") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmThreeST`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyThreeST`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [threeSteamGamesDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmThreeST") {
                threeSteamGamesDisplay.setTitle(
                  `${emojis.VERIFY} Send Confirmed`
                );
                await collector.stop();
                await interaction.editReply({
                  embeds: [threeSteamGamesDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "STEAM", 3, interaction.user);
              } else if (i.customId === "denyThreeST") {
                threeSteamGamesDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [threeSteamGamesDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "GOG")
                await interaction.editReply({
                  embeds: [GOGEmbed],
                  components: [GOGRow, ForceExit],
                });
              else if (i.customId === "firstGameGOG") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmOneGOG`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyOneGOG`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [oneGameGOGDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmOneGOG") {
                oneGameGOGDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [oneGameGOGDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "GOG", 1, interaction.user);
              } else if (i.customId === "denyOneGOG") {
                oneGameGOGDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [oneGameGOGDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "secondGameGOG") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmTwoGOG`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyTwoGOG`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [twoGamesGOGDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmTwoGOG") {
                twoGamesGOGDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [twoGamesGOGDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "GOG", 2, interaction.user);
              } else if (i.customId === "denyTwoGOG") {
                twoGamesGOGDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [twoGamesGOGDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "thirdGameGOG") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmThreeGOG`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyThreeGOG`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [threeGamesGOGDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmThreeGOG") {
                threeGamesGOGDisplay.setTitle(
                  `${emojis.VERIFY} Send Confirmed`
                );
                await collector.stop();
                await interaction.editReply({
                  embeds: [threeGamesGOGDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "GOG", 3, interaction.user);
              } else if (i.customId === "denyThreeGOG") {
                threeGamesGOGDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [threeGamesGOGDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "PRIME")
                await interaction.editReply({
                  embeds: [PRIMEEmbed],
                  components: [PRIMERow, ForceExit],
                });
              else if (i.customId === "firstGamePRIME") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmOnePRIME`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyOnePRIME`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [oneGamePRIMEDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmOnePRIME") {
                oneGamePRIMEDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [oneGamePRIMEDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "PRIME", 1, interaction.user);
              } else if (i.customId === "denyOnePRIME") {
                oneGamePRIMEDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [oneGamePRIMEDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "secondGamePRIME") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmTwoPRIME`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyTwoPRIME`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [twoGamePRIMEDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmTwoPRIME") {
                twoGamePRIMEDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [twoGamePRIMEDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "PRIME", 2, interaction.user);
              } else if (i.customId === "denyTwoPRIME") {
                twoGamePRIMEDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [twoGamePRIMEDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "thirdGamePRIME") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmThreePRIME`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyThreePRIME`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [threeGamePRIMEDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmThreePRIME") {
                threeGamePRIMEDisplay.setTitle(
                  `${emojis.VERIFY} Send Confirmed`
                );
                await collector.stop();
                await interaction.editReply({
                  embeds: [threeGamePRIMEDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "PRIME", 3, interaction.user);
              } else if (i.customId === "denyThreePRIME") {
                threeGamePRIMEDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [threeGamePRIMEDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "EA")
                await interaction.editReply({
                  embeds: [OriginEmbed],
                  components: [ORIGINRow, ForceExit],
                });
              else if (i.customId === "firstGameEA") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmOneEA`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyOneEA`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [oneGameORIGINDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmOneEA") {
                oneGameORIGINDisplay.setTitle(
                  `${emojis.VERIFY} Send Confirmed`
                );
                await collector.stop();
                await interaction.editReply({
                  embeds: [oneGameORIGINDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "EA", 1, interaction.user);
              } else if (i.customId === "denyOneEA") {
                oneGameORIGINDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [oneGameORIGINDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "secondGameEA") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmTwoEA`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyTwoEA`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [twoGameORIGINDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmTwoEA") {
                twoGameORIGINDisplay.setTitle(
                  `${emojis.VERIFY} Send Confirmed`
                );
                await collector.stop();
                await interaction.editReply({
                  embeds: [twoGameORIGINDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "EA", 2, interaction.user);
              } else if (i.customId === "denyTwoEA") {
                twoGameORIGINDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [twoGameORIGINDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "thirdGameEA") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmThreeEA`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyThreeEA`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [threeGameORIGINDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmThreeEA") {
                threeGameORIGINDisplay.setTitle(
                  `${emojis.VERIFY} Send Confirmed`
                );
                await collector.stop();
                await interaction.editReply({
                  embeds: [threeGameORIGINDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "EA", 3, interaction.user);
              } else if (i.customId === "denyThreeEA") {
                threeGameORIGINDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [threeGameORIGINDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "UBI")
                await interaction.editReply({
                  embeds: [UbisoftEmbed],
                  components: [UBIRow, ForceExit],
                });
              else if (i.customId === "firstGameUBI") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmOneUBI`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyOneUBI`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );

                await interaction.editReply({
                  embeds: [oneUBISOFTDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmOneUBI") {
                oneUBISOFTDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [oneUBISOFTDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "UBI", 1, interaction.user);
              } else if (i.customId === "denyOneUBI") {
                oneUBISOFTDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [oneUBISOFTDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "secondGameUBI") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmTwoUBI`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyTwoUBI`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [twoUBISOFTDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmTwoUBI") {
                twoUBISOFTDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [twoUBISOFTDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "UBI", 2, interaction.user);
              } else if (i.customId === "denyTwoUBI") {
                twoUBISOFTDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [twoUBISOFTDisplay],
                  components: [confirmOrDenyD],
                });
              } else if (i.customId === "thirdGameUBI") {
                const confirmOrDeny = new MessageActionRow();
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`confirmThreeUBI`)
                    .setEmoji(emojis.VERIFY)
                    .setLabel(`Confirm`)
                    .setStyle("SUCCESS")
                );
                confirmOrDeny.addComponents(
                  new MessageButton()
                    .setCustomId(`denyThreeUBI`)
                    .setLabel(`Deny`)
                    .setEmoji(emojis.ERROR)
                    .setStyle("DANGER")
                );
                await interaction.editReply({
                  embeds: [threeUBISOFTDisplay],
                  components: [confirmOrDeny, ForceExit],
                });
              } else if (i.customId === "confirmThreeUBI") {
                threeUBISOFTDisplay.setTitle(`${emojis.VERIFY} Send Confirmed`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [threeUBISOFTDisplay],
                  components: [confirmOrDenyD],
                });
                return client.emit("freebieSend", "UBI", 3, interaction.user);
              } else if (i.customId === "denyThreeUBI") {
                threeUBISOFTDisplay.setTitle(`${emojis.ERROR} Send Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [threeUBISOFTDisplay],
                  components: [confirmOrDenyD],
                });
              }
            });
            collector.on("end", async (i) => {
              console.log(green(`Panel closed`));
              await interaction.editReply({
                components: [controlPanelFirstRowD, controlPanelSecondRowD],
              });
            });
          },
        },
        announce: {
          description: "[Developer] Announce a message to the freebie servers",
          args: [
            {
              name: "key",
              description: "Secret key to run the command",
              type: "STRING",
              required: true,
            },
            {
              name: "message",
              description: "The message that you want to send",
              type: "STRING",
              required: true,
              maxLength: 1024,
            },
            {
              name: "mention",
              description: "Mention the free games role in the server",
              type: "BOOLEAN",
              required: false,
            },
          ],
          execute: async ({ client, interaction }) => {
            if (
              interaction.guild.id !== admin.GBF &&
              interaction.guild.id !== admin.Monke &&
              interaction.user.id !== admin.Bunnys &&
              interaction.user.id !== admin.Angel &&
              interaction.channel.id !== admin.codingChannel &&
              interaction.channel.id !== admin.freebieSendChannel
            )
              return interaction.reply({
                embeds: [commandLocked],
                ephemeral: true,
              });

            const validKeys = [admin.keyOne, admin.keyTwo, admin.keyThree];
            const userKeyInput = interaction.options.getString("key");

            if (!validKeys.includes(userKeyInput))
              return interaction.reply({
                embeds: [invalidKey],
                ephemeral: true,
              });

            const announcementText = interaction.options.getString("message");
            const mentionBoolean =
              interaction.options.getBoolean("mention") || false;

            const confirmMessage = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Please verify the information below`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `**Message:** ${announcementText}\n**Mention:** ${
                  mentionBoolean ? "Yes" : "No"
                }`
              )
              .setTimestamp();

            const confirmOrDenyRow = new MessageActionRow();
            confirmOrDenyRow.addComponents(
              new MessageButton()
                .setCustomId(`confirmAnnouncement`)
                .setEmoji(emojis.VERIFY)
                .setLabel(`Confirm`)
                .setStyle("SUCCESS")
            );
            confirmOrDenyRow.addComponents(
              new MessageButton()
                .setCustomId(`denyAnnouncement`)
                .setLabel(`Deny`)
                .setEmoji(emojis.ERROR)
                .setStyle("DANGER")
            );

            await interaction.reply({
              embeds: [confirmMessage],
              components: [confirmOrDenyRow],
            });

            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
              });

            collector.on("collect", async (i) => {
              if (i.customId === "confirmAnnouncement") {
                confirmMessage.setTitle(`${emojis.VERIFY} Announcement Sent`);
                await collector.stop();
                await interaction.editReply({
                  embeds: [confirmMessage],
                  components: [],
                });
                return client.emit(
                  "freebieAnnouncement",
                  announcementText,
                  mentionBoolean,
                  interaction.user
                );
              } else if (i.customId === "denyAnnouncement") {
                confirmMessage.setTitle(`${emojis.ERROR} Announcement Denied`);
                await collector.stop();
                return interaction.editReply({
                  embeds: [confirmMessage],
                  components: [],
                });
              }
            });
          },
        },
      },
    });
  }
};
