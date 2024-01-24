import {
  ApplicationCommandOptionData,
  ApplicationCommandSubCommand,
  ApplicationCommandSubGroup,
  ApplicationCommandType,
  BitFieldResolvable,
  CommandInteraction,
  GatewayIntentBits,
  Message,
} from "discord.js";
import { GBF } from "./GBF";

export type AppConfig = {
  TOKEN: string;
  MongoURI?: string;
};

export type IgnoreEvents = string[] | "All";

export interface IGBF {
  TestServers?: string[];
  Developers?: string[];
  CommandsFolder?: string;
  EventsFolder?: string;
  Prefix?: string;
  Prefixes?: string[];
  LogActions?: boolean;
  AutoLogin?: boolean;
  DMEnabled?: boolean;
  IgnoredEvents?: IgnoreEvents;
  BotConfig?: AppConfig | string;
  SupportServer?: string;
  Version?: string;
  intents: GatewayIntentBits[] | BitFieldResolvable<string, number>;
}

export interface MessageCommandExecute {
  client: GBF;
  message: Message;
  args?: unknown[];
}

export interface CommandOptions<T extends string[] | undefined = string[]> {
  name: string;
  description: string;
  aliases?: string[];
  category?: string;
  NSFW?: boolean;
  usage?: string;
  cooldown?: number;
  UserPermissions?: bigint[];
  BotPermissions?: bigint[];
  DeveloperOnly?: boolean;
  DeveloperBypass?: boolean;
  development?: boolean;
  DMEnabled?: boolean;
  args?: T;
  IgnoreCommand?: boolean;
  execute?: ({
    client,
    message,
    args,
  }: MessageCommandExecute) => Promise<Message | any> | Message | any;
}

export interface SlashExecute {
  client: GBF;
  interaction: CommandInteraction;
}

export interface SubOptions {
  description: string;
  SubCommandOptions?: ApplicationCommandOptionData[];
  UserPermissions?: bigint[];
  BotPermissions?: bigint[];
  NSFW?: boolean;
  DMEnabled?: boolean;
  execute?: ({
    client,
    interaction,
  }: SlashExecute) =>
    | Promise<CommandInteraction | any>
    | CommandInteraction
    | any;
}

export interface SlashOptions {
  name: string;
  description?: string;
  category?: string;
  ContextType?:
    | ApplicationCommandType.Message
    | ApplicationCommandType.User
    | ApplicationCommandType.ChatInput;
  NSFW?: boolean;
  usage?: string;
  options?: ApplicationCommandOptionData[];
  UserPermissions?: bigint[];
  BotPermissions?: bigint[];
  cooldown?: number;
  development?: boolean;
  DMEnabled?: boolean;
  DeveloperOnly?: boolean;
  DeveloperBypass?: boolean;
  groups?: any;
  subcommands?: Record<string, SubOptions>;
  execute?: ({
    client,
    interaction,
  }: SlashExecute) =>
    | Promise<CommandInteraction | any>
    | CommandInteraction
    | any;
}

export interface Config {
  TOKEN: string;
  MongoURI: string;
}
