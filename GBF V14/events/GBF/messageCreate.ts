import {
  ChannelType,
  Client,
  Collection,
  ColorResolvable,
  EmbedBuilder,
  Events,
  Message
} from "discord.js";

import { msToTime, missingPermissions } from "../../utils/Engine";

import {
  Developers,
  PREFIX,
  Partners,
  TestGuilds
} from "../../config/GBFconfig.json";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import blacklistSchema from "../../schemas/GBF Schemas/Bot Ban Schema";
import guildConfigSchema from "../../schemas/GBF Schemas/Prefix Schema";

const cooldowns = new Collection();

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot || message.channel.type === ChannelType.DM) return;

    const blacklistData = await blacklistSchema.findOne({
      userId: message.author.id
    });

    const guildData = await guildConfigSchema.findOne({
      guildID: message.guild.id
    });

    const suspendedEmbed = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't do that`)
      .setDescription(
        `You have been banned from using ${client.user.username}.`
      )
      .setColor(colours.ERRORRED as ColorResolvable);

    if (blacklistData)
      return message.reply({
        embeds: [suspendedEmbed]
      });

    const prefix = guildData ? guildData.Prefix : PREFIX;

    if (!message.content.startsWith(prefix)) return;

    const [cmd, ...args] = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/);

    const command =
      client.commands.get(cmd.toLowerCase()) ||
      client.commands.get(client.aliases.get(cmd.toLowerCase()));

    if (!command) return;

    const testOnlyCommand = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't use that`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(`${command.name} is disabled globally`);

    if (!TestGuilds.includes(message.guild.id))
      return message.reply({
        embeds: [testOnlyCommand]
      });

    if (command.devOnly && !Developers.includes(message.author.id)) {
      const DevOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription("This command is only available for developers.")
        .setColor(colours.ERRORRED as ColorResolvable);

      return message.reply({
        embeds: [DevOnly]
      });
    }

    if (command.Partner && !Partners.includes(message.author.id)) {
      const PartnerOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription(`This command is only available for partners.`)
        .setColor(colours.ERRORRED as ColorResolvable);

      return message.reply({
        embeds: [PartnerOnly]
      });
    }

    if (
      command.userPermission &&
      !message.member.permissions.has(command.userPermission, true)
    ) {
      const MissingUserPerms = new EmbedBuilder()
        .setTitle("Missing Permissions")
        .setDescription(
          `${
            message.author.username
          }, You are missing the following permissions: ${missingPermissions(
            message.member,
            command.userPermission
          )}`
        )
        .setColor(colours.ERRORRED as ColorResolvable);

      return message.reply({
        embeds: [MissingUserPerms]
      });
    }

    if (
      command.botPermission &&
      !message.channel
        .permissionsFor(message.guild.members.me)
        .has(command.botPermission, true)
    ) {
      const missingPermBot = new EmbedBuilder()
        .setTitle("Missing Permissions")
        .setDescription(
          `I am missing the following permissions: ${missingPermissions(
            message.guild.members.me,
            command.botPermission
          )}`
        )
        .setColor(colours.ERRORRED as ColorResolvable);

      return message.reply({
        embeds: [missingPermBot]
      });
    }

    /**
     * @S : Seconds [Unit]
     * @MS : Millisecond [Unit]
     */
    if (
      !command.devBypass ||
      (command.devBypass && !Developers.includes(message.member.id))
    ) {
      const cooldownAmountS: number = command.cooldown;
      if (cooldownAmountS) {
        if (!cooldowns.has(command.name))
          cooldowns.set(command.name, new Map<string, number>());

        const now: number = Date.now();
        const timestamps: any = cooldowns.get(command.name)!;
        const cooldownAmountMS: number = cooldownAmountS * 1000;

        if (timestamps.has(message.author.id)) {
          const expirationTime: number =
            timestamps.get(message.author.id)! + cooldownAmountMS;

          if (now < expirationTime) {
            const timeLeft: number = Number((expirationTime - now).toFixed(1));
            const cooldownembed = new EmbedBuilder()
              .setDescription(
                `${message.author}, please wait ${msToTime(
                  timeLeft
                )} before reusing the \`${command.name}\` command.`
              )
              .setColor(colours.ERRORRED as ColorResolvable);

            return message.reply({
              embeds: [cooldownembed]
            });
          }
        }
        timestamps.set(message.author.id, now);
        setTimeout(
          () => timestamps.delete(message.author.id),
          cooldownAmountMS
        );
      }
    }

    interface CommandProps {
      client: Client;
      message: Message;
      args: any;
    }

    async function runCommand({ client, message, args }: CommandProps) {
      try {
        await command.execute({ client, message, args });
      } catch (err) {
        console.log(
          `I ran into an error running "${command.name}" Error:`,
          err
        );
        return;
      }
    }

    runCommand({ client, message, args });
  });
};
