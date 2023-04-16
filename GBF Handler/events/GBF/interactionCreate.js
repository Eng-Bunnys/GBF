const { Developers, Partners } = require("../../config/GBFconfig.json");
const { Collection, EmbedBuilder, Events } = require("discord.js");
const { msToTime, missingPermissions } = require("../../utils/Engine");
const cooldowns = new Collection();

const emojis = require("../../GBF/GBFEmojis.json");
const colours = require("../../GBF/GBFColor.json");

const blacklistSchema = require("../../schemas/GBF Schemas/Bot Ban Schema");

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const blacklistFetch = await blacklistSchema.findOne({
        userId: interaction.user.id
      });
      try {
        const command = client.slashCommands.get(interaction.commandName);

        if (!command) return;

        if (interaction.inGuild()) {
          const suspendedEmbed = new EmbedBuilder()
            .setTitle(`${emojis.ERROR}`)
            .setDescription(
              `You have been banned from using ${client.user.username}.`
            )
            .setColor(colours.ERRORRED)
            .setThumbnail(
              "https://cdn.discordapp.com/emojis/855834957607075850.gif?v=1"
            );

          if (blacklistFetch && blacklistFetch.Blacklist) {
            return interaction.reply({
              embeds: [suspendedEmbed],
              ephemeral: true
            });
          }

          if (command.Partner && !Partners.includes(interaction.member.id)) {
            const PartnerOnly = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't use that`)
              .setDescription(`This command is only available for partners.`)
              .setColor(colours.ERRORRED);

            return interaction.reply({
              embeds: [PartnerOnly],
              ephemeral: true
            });
          }

          if (command.devOnly && !Developers.includes(interaction.member.id)) {
            const DevOnly = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't use that`)
              .setDescription("This command is only available for developers.")
              .setColor(colours.ERRORRED);

            return interaction.reply({
              embeds: [DevOnly],
              ephemeral: true
            });
          }

          if (
            command.botPermission &&
            !interaction.channel
              .permissionsFor(interaction.guild.members.me)
              .has(command.botPermission, true)
          ) {
            const missingPermBot = new EmbedBuilder()
              .setTitle("Missing Permission")
              .setDescription(
                `I am missing the following permissions: ${missingPermissions(
                  interaction.guild.members.me,
                  command.botPermission
                )}`
              )
              .setColor(colours.ERRORRED);

            return interaction.reply({
              embeds: [missingPermBot],
              ephemeral: true
            });
          }

          if (
            command.userPermission &&
            !interaction.member.permissions.has(command.userPermission, true)
          ) {
            const missingPermUser = new EmbedBuilder()
              .setTitle("Missing Permissions")
              .setDescription(
                `You are missing the following permissions: ${missingPermissions(
                  interaction.member,
                  command.userPermission
                )}`
              )
              .setColor(colours.ERRORRED);

            return interaction.reply({
              embeds: [missingPermUser],
              ephemeral: true
            });
          }
        }
        /**
         * @S : Seconds [Unit]
         * @MS : Millisecond [Unit]
         */
        if (
          !command.devBypass ||
          (command.devBypass && !Developers.includes(interaction.member.id))
        ) {
          const cooldownAmountS = command.cooldown;
          if (cooldownAmountS) {
            if (!cooldowns.has(command.name))
              cooldowns.set(command.name, new Collection());

            const now = Date.now();
            const timestamps = cooldowns.get(command.name);
            const cooldownAmountMS = cooldownAmountS * 1000;

            if (timestamps.has(interaction.user.id)) {
              const expirationTime =
                timestamps.get(interaction.user.id) + cooldownAmountMS;

              if (now < expirationTime) {
                const timeLeft = Number((expirationTime - now).toFixed(1));
                const cooldownembed = new EmbedBuilder()
                  .setDescription(
                    `${interaction.user}, please wait ${msToTime(
                      Number(timeLeft)
                    )} before reusing the \`${command.name}\` command.`
                  )
                  .setColor(colours.ERRORRED);

                return interaction.reply({
                  embeds: [cooldownembed],
                  ephemeral: true
                });
              }
            }
            timestamps.set(interaction.user.id, now);
            setTimeout(
              () => timestamps.delete(interaction.user.id),
              cooldownAmountMS
            );
          }
        }

        const group = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);

        try {
          if (command.groups || command.subcommands) {
            const sub = command.groups
              ? command.groups[group].subcommands[subcommand]
              : command.subcommands[subcommand];

            if (sub.execute)
              return await sub.execute({
                client,
                interaction,
                group,
                subcommand
              });
          }

          await command.execute({
            client,
            interaction,
            group,
            subcommand
          });
        } catch (e) {
          console.log(`Error running command '${command.name}'`);
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      if (interaction.isButton()) {
        const command = client.buttonCommands.get(
          interaction.customId.toLowerCase()
        );
        if (!command) return;
        if (interaction.inGuild()) {
          if (command.devOnly && !Developers.includes(interaction.member.id)) {
            const devonlyembed = new EmbedBuilder()
              .setDescription("Only developers can use this command.")
              .setColor(colours.ERRORRED);

            return interaction.reply({
              embeds: [devonlyembed],
              ephemeral: true
            });
          }

          if (
            command.userPermission &&
            !interaction.member.permissions.has(command.userPermission, true)
          ) {
            const permissionembed = new EmbedBuilder()
              .setTitle("Missing Permissions")
              .setDescription(
                `You are missing the following permissions: ${missingPermissions(
                  interaction.member,
                  command.userPermission
                )}`
              )
              .setColor(colours.ERRORRED);

            return interaction.reply({
              embeds: [permissionembed],
              ephemeral: true
            });
          }

          if (
            command.botPermission &&
            !interaction.channel
              .permissionsFor(interaction.guild.members.me)
              .has(command.botPermission, true)
          ) {
            const botpermissionembed = new EmbedBuilder()
              .setTitle("Missing Permission")
              .setDescription(
                `I am missing the following permissions: ${missingPermissions(
                  interaction.guild.members.me,
                  command.botPermission
                )}`
              )
              .setColor(colours.ERRORRED);

            return interaction.reply({
              embeds: [botpermissionembed],
              ephemeral: true
            });
          }
          /**
           * @S : Seconds [Unit]
           * @MS : Millisecond [Unit]
           */
          if (
            !command.devBypass ||
            (command.devBypass && !Developers.includes(interaction.member.id))
          ) {
            const cooldownAmountS = command.cooldown;
            if (cooldownAmountS) {
              if (!cooldowns.has(command.name))
                cooldowns.set(command.name, new Collection());

              const now = Date.now();
              const timestamps = cooldowns.get(command.name);
              const cooldownAmountMS = cooldownAmountS * 1000;

              if (timestamps.has(interaction.user.id)) {
                const expirationTime =
                  timestamps.get(interaction.user.id) + cooldownAmountMS;

                if (now < expirationTime) {
                  const timeLeft = Number((expirationTime - now).toFixed(1));
                  const cooldownembed = new EmbedBuilder()
                    .setDescription(
                      `${interaction.user}, please wait ${msToTime(
                        Number(timeLeft)
                      )} before reusing the \`${command.name}\` command.`
                    )
                    .setColor(colours.ERRORRED);

                  return interaction.reply({
                    embeds: [cooldownembed],
                    ephemeral: true
                  });
                }
              }
              timestamps.set(interaction.user.id, now);
              setTimeout(
                () => timestamps.delete(interaction.user.id),
                cooldownAmountMS
              );
            }
          }
        }
        try {
          await command.execute({
            client,
            interaction
          });
        } catch (error) {
          console.log(
            `I ran into an error running "${command.name}" Error:`,
            error
          );
        }
      } else {
        if (interaction.isStringSelectMenu()) {
          const command = client.selectCmds.get(
            interaction.customId.toLowerCase()
          );
          if (!command) return;
          if (interaction.inGuild()) {
            if (
              command.userPermission &&
              !interaction.member.permissions.has(command.userPermission, true)
            ) {
              const permissionembed = new EmbedBuilder()
                .setTitle("Missing Permissions")
                .setDescription(
                  `You are missing the following permissions: ${missingPermissions(
                    interaction.member,
                    command.userPermission
                  )}`
                )
                .setColor(colours.ERRORRED);

              return interaction.reply({
                embeds: [permissionembed],
                ephemeral: true
              });
            }

            if (
              command.botPermission &&
              !interaction.channel
                .permissionsFor(interaction.guild.members.me)
                .has(command.botPermission, true)
            ) {
              const botpermembed = new EmbedBuilder()
                .setTitle("Missing Permissions")
                .setDescription(
                  `I am missing the following Permission: ${missingPermissions(
                    interaction.guild.members.me,
                    command.botPermission
                  )}`
                )
                .setColor(colours.ERRORRED);

              return interaction.reply({
                embeds: [botpermembed],
                ephemeral: true
              });
            }

            /**
             * @S : Seconds [Unit]
             * @MS : Millisecond [Unit]
             */
            if (
              !command.devBypass ||
              (command.devBypass && !Developers.includes(interaction.member.id))
            ) {
              const cooldownAmountS = command.cooldown;
              if (cooldownAmountS) {
                if (!cooldowns.has(command.name))
                  cooldowns.set(command.name, new Collection());

                const now = Date.now();
                const timestamps = cooldowns.get(command.name);
                const cooldownAmountMS = cooldownAmountS * 1000;

                if (timestamps.has(interaction.user.id)) {
                  const expirationTime =
                    timestamps.get(interaction.user.id) + cooldownAmountMS;

                  if (now < expirationTime) {
                    const timeLeft = Number((expirationTime - now).toFixed(1));
                    const cooldownembed = new EmbedBuilder()
                      .setDescription(
                        `${interaction.user}, please wait ${msToTime(
                          Number(timeLeft)
                        )} before reusing the \`${command.name}\` command.`
                      )
                      .setColor(colours.ERRORRED);

                    return interaction.reply({
                      embeds: [cooldownembed],
                      ephemeral: true
                    });
                  }
                }
                timestamps.set(interaction.user.id, now);
                setTimeout(
                  () => timestamps.delete(interaction.user.id),
                  cooldownAmountMS
                );
              }
            }
            try {
              await command.execute({
                client,
                interaction
              });
            } catch (error) {
              console.log(
                `I ran into an error running "${command.name}" Error:`,
                error
              );
            }
          }
        } else {
          if (interaction.isUserContextMenuCommand()) {
            const command = client.contextCmds.get(
              interaction.customId.toLowerCase()
            );
            if (!command) return;

            if (interaction.inGuild()) {
              if (
                command.userPermission &&
                !interaction.member.permissions.has(
                  command.userPermission,
                  true
                )
              ) {
                const permissionembed = new EmbedBuilder()
                  .setTitle("Missing Permissions")
                  .setDescription(
                    `You are missing the following permissions: ${missingPermissions(
                      interaction.member,
                      command.userPermission
                    )}`
                  )
                  .setColor(colours.ERRORRED);

                return interaction.reply({
                  embeds: [permissionembed],
                  ephemeral: true
                });
              }

              if (
                command.botPermission &&
                !interaction.channel
                  .permissionsFor(interaction.guild.members.me)
                  .has(command.botPermission, true)
              ) {
                const botpermembed = new EmbedBuilder()
                  .setTitle("Missing Permissions")
                  .setDescription(
                    `I am missing the following Permission: ${missingPermissions(
                      interaction.guild.members.me,
                      command.botPermission
                    )}`
                  )
                  .setColor(colours.ERRORRED);

                return interaction.reply({
                  embeds: [botpermembed],
                  ephemeral: true
                });
              }

              /**
               * @S : Seconds [Unit]
               * @MS : Millisecond [Unit]
               */
              if (
                !command.devBypass ||
                (command.devBypass &&
                  !Developers.includes(interaction.member.id))
              ) {
                const cooldownAmountS = command.cooldown;
                if (cooldownAmountS) {
                  if (!cooldowns.has(command.name))
                    cooldowns.set(command.name, new Collection());

                  const now = Date.now();
                  const timestamps = cooldowns.get(command.name);
                  const cooldownAmountMS = cooldownAmountS * 1000;

                  if (timestamps.has(interaction.user.id)) {
                    const expirationTime =
                      timestamps.get(interaction.user.id) + cooldownAmountMS;

                    if (now < expirationTime) {
                      const timeLeft = Number(
                        (expirationTime - now).toFixed(1)
                      );
                      const cooldownembed = new EmbedBuilder()
                        .setDescription(
                          `${interaction.user}, please wait ${msToTime(
                            Number(timeLeft)
                          )} before reusing the \`${command.name}\` command.`
                        )
                        .setColor(colours.ERRORRED);

                      return interaction.reply({
                        embeds: [cooldownembed],
                        ephemeral: true
                      });
                    }
                  }
                  timestamps.set(interaction.user.id, now);
                  setTimeout(
                    () => timestamps.delete(interaction.user.id),
                    cooldownAmountMS
                  );
                }
              }
              try {
                await command.execute({
                  client,
                  interaction
                });
              } catch (error) {
                console.log(
                  `I ran into an error running "${command.name}" Error:`,
                  error
                );
              }
            }
          }
        }
      }
    }
  });
};
