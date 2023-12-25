import { ChannelType, Events, Message } from "discord.js";
import { BotBanModel, IBotBan } from "../../models/GBF/Bot Ban Schema";
import {
  BotGuildModel,
  IGuildData,
} from "../../models/GBF/Bot Settings Schema";
import { Document } from "mongoose";
import { HandlerChecks } from "../../utils/GBF Features";
import { SendAndDelete } from "../../utils/Engine";
import { GBF } from "../GBF";
import { MessageCommand } from "../Command Handlers/Message Handler";
import { CommandOptions } from "../types";

export default async function GBFMessageCreate(client: GBF) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;

    let BanData: (IBotBan & Document<any, any, IBotBan>) | null =
      client.DatabaseInteractions
        ? await BotBanModel.findOne({ userId: message.author.id })
        : null;

    let GuildSettings: (IGuildData & Document<any, any, IGuildData>) | null =
      message.channel.type === ChannelType.DM
        ? null
        : client.DatabaseInteractions
        ? (await BotGuildModel.findOne({ guildID: message.guildId })) ||
          (await new BotGuildModel({ guildID: message.guildId }).save())
        : null;

    const BotPrefixes = [
      GuildSettings ? GuildSettings.Prefix : client.Prefix,
      client.Prefix,
      ...client.Prefixes,
    ].filter((prefix) => prefix !== null);

    let FoundPrefix = null;
    for (const prefix of BotPrefixes) {
      if (message.content.startsWith(prefix)) {
        FoundPrefix = prefix;
        break;
      }
    }

    if (!FoundPrefix) return;

    const [cmd, ...args] = message.content
      .slice(FoundPrefix.length)
      .trim()
      .split(/ +/);

    const command: MessageCommand<string[]> | CommandOptions =
      client.MessageCommands.get(cmd.toLowerCase()) ||
      client.MessageCommands.get(client.aliases.get(cmd.toLowerCase()));

    if (!command) return;

    const HandlerCheck = await new HandlerChecks(
      client,
      message.author,
      message.member,
      BanData,
      GuildSettings,
      command,
      message
    ).RunChecks();

    if (!HandlerCheck[1]) {
      SendAndDelete(message.channel, {
        content: `<@${message.author.id}>`,
        embeds: [HandlerCheck[0]],
      });
    }

    try {
      await command.execute(client, message, args);
    } catch (err) {
      return console.log(
        `I ran into an error running "${command.options.name}\n${err}`
      );
    }
  });
}