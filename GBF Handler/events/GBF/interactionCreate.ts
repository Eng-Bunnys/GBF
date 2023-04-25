import { Developers, Partners } from "../../config/GBFconfig.json";

import { Collection, ColorResolvable, EmbedBuilder, Events } from "discord.js";

import { msToTime, missingPermissions } from "../../utils/Engine";

import emojis from "../../GBF/GBFEmojis.json";
import colours from "../../GBF/GBFColor.json";

import blacklistSchema from "../../schemas/GBF Schemas/Bot Ban Schema";

import { capitalize } from "../../utils/Engine";

const cooldowns = new Collection();

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    const blackListData = await blacklistSchema.findOne({
      userId: interaction.user.id
    });

    const suspendedEmbed = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't do that`)
      .setDescription(
        `You have been banned from using ${client.user.username}.`
      )
      .setColor(colours.ERRORRED as ColorResolvable);

    if (blackListData)
      return interaction.reply({
        embeds: [suspendedEmbed],
        ephemeral: true
      });

    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);

      if (!command) return;

      if (command.Partner && !Partners.includes(interaction.user.id)) {
        const PartnerOnly = new EmbedBuilder()
          .setTitle(`${emojis.ERROR} You can't use that`)
          .setDescription(`This command is only available for partners.`)
          .setColor(colours.ERRORRED as ColorResolvable);

        return interaction.reply({
          embeds: [PartnerOnly],
          ephemeral: true
        });
      }

      if (command.devOnly && !Developers.includes(interaction.user.id)) {
        const DevOnly = new EmbedBuilder()
          .setTitle(`${emojis.ERROR} You can't use that`)
          .setDescription("This command is only available for developers.")
          .setColor(colours.ERRORRED as ColorResolvable);

        return interaction.reply({
          embeds: [DevOnly],
          ephemeral: true
        });
      }

      if (
        !command.devBypass ||
        (command.devBypass && !Developers.includes(interaction.user.id))
      ) {
        const cooldownAmountS = command.cooldown;
        if (cooldownAmountS) {
          if (!cooldowns.has(command.name))
            cooldowns.set(command.name, new Collection());

          const now = Date.now();
          const timestamps: any = cooldowns.get(command.name);
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
                  )} before reusing the \`${capitalize(
                    command.name
                  )}\` command.`
                )
                .setColor(colours.ERRORRED as ColorResolvable);

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

      if (!command.dmEnabled && !interaction.inGuild()) {
        const dmDisabled = new EmbedBuilder()
          .setTitle(`${emojis.ERROR} You can't do that`)
          .setColor(colours.ERRORRED as ColorResolvable)
          .setDescription(`${capitalize(command.name)} is disabled in DMs.`);

        return interaction.reply({
          embeds: [dmDisabled]
        });
      }

      if (interaction.inGuild()) {
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
            .setColor(colours.ERRORRED as ColorResolvable);

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
            .setColor(colours.ERRORRED as ColorResolvable);

          return interaction.reply({
            embeds: [missingPermUser],
            ephemeral: true
          });
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
        console.log(`Error running command '${command.name}'\n${e}`);
      }
    }
  });
};
