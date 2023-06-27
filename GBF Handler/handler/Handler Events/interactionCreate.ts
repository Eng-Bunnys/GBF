import {
  ApplicationCommandType,
  Collection,
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
  Events,
  GuildMember,
  PermissionResolvable,
  TextChannel
} from "discord.js";

import { msToTime, missingPermissions } from "../../utils/Engine";

import emojis from "../../GBF/GBFEmojis.json";
import colours from "../../GBF/GBFColor.json";

import { GBFBotBanModel } from "../../schemas/GBF Schemas/Bot Ban Schema";

import { capitalize } from "../../utils/Engine";
import { GBFSlashOptions } from "../handlerforSlash";

import {
  GBFGuildDataModel,
  IGuildData
} from "../../schemas/GBF Schemas/Guild Data Schema";
import GBFClient from "../clienthandler";

const cooldowns = new Collection();

export default function interactionCreate(client) {
  client.on(
    Events.InteractionCreate,
    async (interaction: CommandInteraction) => {
      const blackListData = await GBFBotBanModel.findOne({
        userId: interaction.user.id
      });

      let guildData: IGuildData | null;

      if (!interaction.inGuild()) guildData = null;
      else
        guildData = await GBFGuildDataModel.findOne({
          guildID: interaction.guild.id
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

      const PartnerOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription(`This command is only available for partners.`)
        .setColor(colours.ERRORRED as ColorResolvable);

      const DevOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription("This command is only available for developers.")
        .setColor(colours.ERRORRED as ColorResolvable);

      if (interaction.isCommand()) {
        if (
          interaction.isUserContextMenuCommand() ||
          interaction.isMessageContextMenuCommand()
        ) {
          const command: GBFSlashOptions = client.slashCommands.get(
            interaction.commandName
          );

          if (!command) return;

          if (
            command.partner &&
            !(client as GBFClient).Partners.includes(interaction.user.id)
          ) {
            return interaction.reply({
              embeds: [PartnerOnly],
              ephemeral: true
            });
          }

          if (
            command.devOnly &&
            !(client as GBFClient).Developers.includes(interaction.user.id)
          ) {
            return interaction.reply({
              embeds: [DevOnly],
              ephemeral: true
            });
          }

          try {
            //@ts-ignore
            await command.execute({
              client,
              interaction
            });
          } catch (err) {
            console.log(`Error running command '${command.name}'\n${err}`);
          }
        }
      }

      if (interaction.isChatInputCommand()) {
        const command: GBFSlashOptions = client.slashCommands.get(
          interaction.commandName
        );

        if (!command) return;

        if (
          command.partner &&
          !(client as GBFClient).Partners.includes(interaction.user.id)
        ) {
          return interaction.reply({
            embeds: [PartnerOnly],
            ephemeral: true
          });
        }

        if (
          command.devOnly &&
          !(client as GBFClient).Developers.includes(interaction.user.id)
        ) {
          return interaction.reply({
            embeds: [DevOnly],
            ephemeral: true
          });
        }

        const DisabledCommand = new EmbedBuilder()
          .setTitle(`${emojis.ERROR} You can't do that`)
          .setColor(colours.ERRORRED as ColorResolvable)
          .setDescription(
            `This command is disabled in ${interaction.guild.name}`
          );

        if (guildData && guildData.DisabledCommands.includes(command.name))
          return interaction.reply({
            embeds: [DisabledCommand],
            ephemeral: true
          });

        if (
          !command.devBypass ||
          (command.devBypass &&
            !(client as GBFClient).Developers.includes(interaction.user.id))
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

        if (interaction.inGuild()) {
          if (
            command.botPermission &&
            !interaction.channel
              .permissionsFor(interaction.guild.members.me)
              .has(command.botPermission as PermissionResolvable, true)
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
            !(interaction.member as GuildMember).permissions.has(
              command.userPermission as PermissionResolvable,
              true
            )
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
          //@ts-ignore
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
    }
  );
}
