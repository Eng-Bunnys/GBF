import {
  ApplicationCommandOptionData,
  ApplicationCommandType,
  BitFieldResolvable,
  CommandInteraction,
  GatewayIntentBits,
  Message,
  MessageContextMenuCommandInteraction,
  Snowflake,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { BuiltInCommands, BuiltInEvents, GBF } from "./GBF";

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
  AppealURL?: string;
  IgnoredEvents?: IgnoreEvents;
  BotConfig?: AppConfig | string;
  SupportServer?: string;
  Version?: string;
  DisabledHandlerEvents?: BuiltInEvents[];
  DisabledHandlerCommands?: BuiltInCommands[];
  DisabledCommands?: string[];
  LogsChannel?: Snowflake[];
  DatabaseInteractions?: boolean;
  intents: GatewayIntentBits[] | BitFieldResolvable<string, number>;
}

export interface MessageCommandExecute {
  client: GBF;
  message: Message;
  args?: unknown[];
}

export interface MessageCommandOptions<
  T extends string[] | undefined = string[]
> {
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

export interface ContextExecute {
  client: GBF;
  interaction:
    | UserContextMenuCommandInteraction
    | MessageContextMenuCommandInteraction;
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
  description: string;
  category?: string;
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
  IgnoreCommand?: boolean;
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

export interface ContextOptions {
  name: string;
  category?: string;
  ContextType: ApplicationCommandType.Message | ApplicationCommandType.User;
  NSFW?: boolean;
  UserPermissions?: bigint[];
  BotPermissions?: bigint[];
  cooldown?: number;
  development?: boolean;
  DMEnabled?: boolean;
  DeveloperOnly?: boolean;
  IgnoreCommand?: boolean;
  DeveloperBypass?: boolean;
  execute?: ({
    client,
    interaction,
  }: ContextExecute) => Promise<CommandInteraction | any> | any;
}

export interface Config {
  TOKEN: string;
  MongoURI: string;
}
