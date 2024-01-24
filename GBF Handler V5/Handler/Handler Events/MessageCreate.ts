import { ChannelType, Events, Message } from "discord.js";
import { Document } from "mongoose";
import { GBF } from "../GBF";
import { MessageCommand } from "../Command Handlers/Message Handler";
import { CommandOptions } from "../types";
import { IBotBan, BotBanModel } from "../Handler Models/Bot Ban Schema";
import {
  IGuildData,
  BotGuildModel,
} from "../Handler Models/Bot Settings Schema";
import { HandlerChecks } from "../Utils/Handler Features";
import { SendAndDelete } from "../../Utils/Utils";
import { redBright } from "chalk";
export function GBFMessageCreate(client: GBF) {
  client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return;

    const BanData: (IBotBan & Document<any, any, IBotBan>) | null =
      await BotBanModel.findOne({ userId: message.author.id });

    const GuildSettings: (IGuildData & Document<any, any, IGuildData>) | null =
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

    const Command: MessageCommand<string[]> | CommandOptions =
      client.MessageCommands.get(LowerCommandName) ||
      client.MessageCommands.get(client.Aliases.get(LowerCommandName));

    if (!Command) return;

    const HandlerCheck = await new HandlerChecks(
      client,
      message.author,
      message.member,
      BanData,
      GuildSettings,
      Command,
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
      await Command.CommandOptions.execute({ client, message, args });
    } catch (ExecuteError) {
      console.log(
        redBright(
          `Error running "${Command.CommandOptions.name}"\n${ExecuteError}`
        )
      );
    }
  });
}