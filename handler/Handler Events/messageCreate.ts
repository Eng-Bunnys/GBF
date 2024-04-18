import {
  ChannelType,
  Client,
  Collection,
  ColorResolvable,
  EmbedBuilder,
  Events,
  Message,
  PermissionResolvable,
  TextChannel
} from "discord.js";

import {
  missingPermissions,
  capitalize,
  SendAndDelete
} from "../../utils/Engine";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import { GBFBotBanModel } from "../../schemas/GBF Schemas/Bot Ban Schema";

import {
  GBFGuildDataModel,
  IGuildData
} from "../../schemas/GBF Schemas/Guild Data Schema";
import { CommandOptions } from "../commandhandler";
import GBFClient from "../clienthandler";

const cooldowns = new Collection();

export default function messageCreate(client) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;

    const blacklistData = await GBFBotBanModel.findOne({
      userId: message.author.id
    });

    let guildData: IGuildData | null;

    if (message.channel.type === ChannelType.DM) guildData = null;
    else
      guildData = await GBFGuildDataModel.findOne({
        guildID: message.guild.id
      });

    const SuspendedEmbed = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't do that`)
      .setDescription(
        `You have been banned from using ${client.user.username}.`
      )
      .setColor(colours.ERRORRED as ColorResolvable);

    if (blacklistData)
      return SendAndDelete(message.channel, {
        content: `<@${message.author.id}>`,
        embeds: [SuspendedEmbed]
      });

    const prefix = guildData ? guildData.Prefix : (client as GBFClient).Prefix;

    if (!message.content.startsWith(prefix)) return;

    const [cmd, ...args] = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/);

    const command: CommandOptions =
      client.commands.get(cmd.toLowerCase()) ||
      client.commands.get(client.aliases.get(cmd.toLowerCase()));

    if (!command) return;

    const TestOnlyCommand = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't use that`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(`${command.name} is disabled globally`);

    if (
      command.development &&
      !(client as GBFClient).TestServers.includes(message.guild.id)
    )
      return SendAndDelete(message.channel, {
        content: `<@${message.author.id}>`,
        embeds: [TestOnlyCommand]
      });

    if (!command.dmEnabled && message.channel.type === ChannelType.DM) {
      const dmDisabled = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED as ColorResolvable)
        .setDescription(`${capitalize(command.name)} is disabled in DMs.`);

      return SendAndDelete(message.channel, {
        content: `${message.author}`,
        embeds: [dmDisabled]
      });
    }

    if (
      command.devOnly &&
      !(client as GBFClient).Developers.includes(message.author.id)
    ) {
      const DevOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription("This command is only available for developers.")
        .setColor(colours.ERRORRED as ColorResolvable);

      return message.reply({
        embeds: [DevOnly]
      });
    }

    if (
      command.partner &&
      !(client as GBFClient).Partners.includes(message.author.id)
    ) {
      const PartnerOnly = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't use that`)
        .setDescription(`This command is only available for partners.`)
        .setColor(colours.ERRORRED as ColorResolvable);

      return SendAndDelete(message.channel, {
        content: `<@${message.author.id}>`,
        embeds: [PartnerOnly]
      });
    }

    const DisabledCommand = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't do that`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(`This command is disabled in ${message.guild.name}`);

    if (guildData && guildData.DisabledCommands.includes(command.name))
      return SendAndDelete(message.channel, {
        content: `<@${message.author.id}>`,
        embeds: [DisabledCommand]
      });

    const NSFWDisabled = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't do that`)
      .setColor(colours.ERRORRED as ColorResolvable)
      .setDescription(
        `This is an age-restricted command, this can only be used in age-restricted channels.`
      );

    if (
      command.NSFW &&
      message.channel.type !== ChannelType.DM &&
      !(message.channel as TextChannel).nsfw
    )
      return SendAndDelete(message.channel, {
        content: `<@${message.author.id}>`,
        embeds: [NSFWDisabled]
      });

    if (message.channel.type !== ChannelType.DM) {
      if (
        command.userPermission &&
        !message.member.permissions.has(
          command.userPermission as PermissionResolvable,
          true
        )
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

        return SendAndDelete(message.channel, {
          content: `<@${message.author.id}>`,
          embeds: [MissingUserPerms]
        });
      }

      if (
        command.botPermission &&
        !message.channel
          .permissionsFor(message.guild.members.me)
          .has(command.botPermission as PermissionResolvable, true)
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

        return SendAndDelete(message.channel, {
          content: `<@${message.author.id}>`,
          embeds: [missingPermBot]
        });
      }
    }

    /**
     * @S : Seconds [Unit]
     * @MS : Millisecond [Unit]
     */
    if (
      !command.devBypass ||
      (command.devBypass &&
        !(client as GBFClient).Developers.includes(message.member.id))
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

            const unixExpirationTime = Math.round(
              Date.now() / 1000 + timeLeft / 1000
            );

            const CooldownEmbed = new EmbedBuilder()
              .setDescription(
                `${message.author}, you can reuse "${command.name}" <t:${unixExpirationTime}:R>`
              )
              .setColor(colours.ERRORRED as ColorResolvable);

            return SendAndDelete(
              message.channel,
              {
                content: `${message.author}`,
                embeds: [CooldownEmbed]
              },
              cooldownAmountMS / 1000
            );
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
      args: string[];
    }

    async function runCommand({
      client,
      message,
      args
    }: CommandProps): Promise<void> {
      try {
        //@ts-ignore
        await command.execute({ client, message, args });
      } catch (err) {
        return console.log(
          `I ran into an error running "${command.name}" Error:\n${err}`
        );
      }
    }

    runCommand({ client, message, args });
  });
}
