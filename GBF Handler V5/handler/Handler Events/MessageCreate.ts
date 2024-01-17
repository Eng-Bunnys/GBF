import { ChannelType, Events, Message } from "discord.js";
import { BotBanModel, IBotBan } from "../../models/GBF/Bot Ban Schema";
import {
  BotGuildModel,
  IGuildData,
} from "../../models/GBF/Bot Settings Schema";
import { Document } from "mongoose";
import { HandlerChecks } from "../../utils/GBF Features";
import { SendAndDelete } from "../../utils/Utils";
import { GBF } from "../GBF";
import { MessageCommand } from "../Command Handlers/Message Handler";
import { CommandOptions } from "../types";

export default async function GBFMessageCreate(client: GBF) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;

    let BanData: (IBotBan & Document<any, any, IBotBan>) | null =
      await BotBanModel.findOne({ userId: message.author.id });

    let GuildSettings: (IGuildData & Document<any, any, IGuildData>) | null =
      message.channel.type === ChannelType.DM
        ? null
        : (await BotGuildModel.findOne({ guildID: message.guildId })) ||
          (await new BotGuildModel({ guildID: message.guildId }).save());

    const BotPrefixes = [
      GuildSettings ? GuildSettings.Prefix : client.Prefix,
      client.Prefix,
      ...client.Prefixes,
    ].filter((prefix) => prefix !== null);

    const FoundPrefix = BotPrefixes.find((prefix) =>
      message.content.startsWith(prefix)
    );

    if (!FoundPrefix) return;

    const [CommandName, ...args] = message.content
      .slice(FoundPrefix.length)
      .trim()
      .split(/ +/);

    const LowerCommandName = CommandName.toLocaleLowerCase();

    const command: MessageCommand<string[]> | CommandOptions =
      client.MessageCommands.get(LowerCommandName) ||
      client.MessageCommands.get(client.aliases.get(LowerCommandName));

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
      return;
    }

    try {
      await command.options.execute({ client, message, args });
    } catch (err) {
      return console.log(
        `I ran into an error running "${command.options.name}\n${err}`
      );
    }
  });
}
