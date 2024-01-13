import {
  GatewayIntentBits,
  BitFieldResolvable,
  Message,
  ApplicationCommandType,
  ApplicationCommandOptionData,
  ApplicationCommandSubCommand,
  ApplicationCommandSubGroup,
  CommandInteraction,
} from "discord.js";
import { GBF } from "./GBF";

/**
 * Represents the JSON configuration for the bot.
 */
type JSONConfig = {
  TOKEN: string;
  MongoURI?: string;
};

/**
 * Represents the environment variable configuration for the bot.
 */
type ENVConfig = {
  TOKEN: string;
  MongoURI?: string;
};

/**
 * Represents the combined configuration for the bot, which can be either JSONConfig or ENVConfig.
 */
export type AppConfig = JSONConfig | ENVConfig;

/**
 * Represents the structure of a message command execution context.
 * This interface is used to define the parameters required for executing a message command.
 */
export interface MessageCommandExecute {
  /**
   * The client instance implementing the IGBFClient interface.
   * It represents the client.
   */
  client: IGBFClient;

  /**
   * The Discord.js Message object associated with the command.
   * It contains information about the message that triggered the command.
   */
  message: Message;

  /**
   * An array containing the command arguments.
   * These arguments are passed to the command for further processing.
   * The type is set to unknown[] as the specific argument types are determined by the individual commands.
   */
  args?: unknown[];
}

export interface IGBFClient {
  /**The installed version fo the GBF Handler */
  HandlerVersion?: string;
  /**The location of your commands folder Eg. ./commands */
  CommandsFolder?: string;
  /**The location of your commands folder Eg. ./events */
  EventsFolder?: string;
  /**Log handler actions like commands registered etc. */
  LogActions?: boolean;
  /**Your bot's default prefix */
  Prefix?: string;
  /**An array of prefixes, use this if you want to have more than one prefix. */
  Prefixes?: string[];
  /**An array that contains all of the bot's developers' IDs */
  Developers?: string[];
  /**The location of your config folder Eg. path.join(__dirname, "./config/GBFconfig.json") */
  config?: string | AppConfig;
  /**Automatically login without having to call the login function */
  AutoLogin?: boolean;
  /**Log into your database allowing for database interactions */
  DatabaseInteractions?: boolean;
  /**The bot's intents */
  intents: GatewayIntentBits[] | BitFieldResolvable<string, number>;
  /**An array that contains all of the test servers that get the development commands */
  TestServers?: string[];
  /**A channel to log important bot activity like bot user bans */
  LogsChannel?: string;
  /**An array that contains all of your bot's partners' IDs */
  Partners?: string[];
  /**A URL to your bot's support server */
  SupportServer?: string;
  /**Your bot's version | Default: 1.0.0 */
  Version?: string;
  /**A boolean that sets whether the bot's commands can be ran in DMs or not | Default: false */
  DMCommands?: boolean;
}

/**
 * Represents the options for a command.
 * @template T - Type of the command arguments (defaults to an array of strings or undefined).
 */
export interface CommandOptions<T extends string[] | undefined = string[]> {
  /** The unique name of the command. */
  name?: string;
  /** Alternative names or aliases for the command. */
  aliases?: string[];
  /** Category or group to which the command belongs. */
  category?: string;
  /** Brief description of what the command does. */
  description?: string;
  /** Indicates whether the command is Not Safe For Work. */
  NSFW?: boolean;
  /** Usage information for the command. */
  usage?: string;
  /** Examples demonstrating the usage of the command. */
  examples?: string;
  /** Cooldown period for the command, in seconds. */
  cooldown?: number;
  /** Required user permissions for executing the command. */
  UserPermissions?: bigint[];
  /** Required bot permissions for the command to function properly. */
  BotPermissions?: bigint[];
  /** Whether the command is only available for development purposes. */
  DeveloperOnly?: boolean;
  /** Allows developers to bypass certain restrictions for the command during development. */
  DeveloperBypass?: boolean;
  /** Whether the command registers globally or in development only servers. */
  development?: boolean;
  /** Whether the command is enabled in direct messages (DMs). */
  DMEnabled?: boolean;
  /** Whether the command is meant for use in partnership-related contexts. */
  partner?: boolean;
  /** Expected arguments for the command (array of strings or undefined if no arguments are required). */
  args?: T;
  /** The command will not register if set to true */
  IgnoreCommand?: boolean;
  execute?: ({ client, message, args }: MessageCommandExecute) => unknown;
}

export interface SubCommandOptions {
  name: string;
  description: string;
  SubCommandOptions: ApplicationCommandOptionData[];
  execute?: ({
    client,
    interaction,
  }: {
    client: GBF;
    interaction: CommandInteraction;
  }) => unknown;
}

/**
 * Represents the options for a slash command.
 */
export interface SlashOptions {
  /** The unique name of the slash command. */
  name: string;
  /** Brief description of what the slash command does. */
  description: string;
  /** Category or group to which the slash command belongs. */
  category?: string;
  /** Type of context in which the slash command can be used. */
  ContextType?: ApplicationCommandType.Message | ApplicationCommandType.User;
  /** Indicates whether the slash command is Not Safe For Work. */
  NSFW?: boolean;
  /** Usage information for the slash command. */
  usage?: string;
  /** Examples demonstrating the usage of the slash command. */
  examples?: string;
  /** Options for the slash command. */
  options?: ApplicationCommandOptionData[];
  /** Default permission status for the slash command. */
  DefaultPermission?: boolean;
  /** Required user permissions for executing the slash command. */
  UserPermissions?: bigint[];
  /** Required bot permissions for the slash command to function properly. */
  BotPermissions?: bigint[];
  /** Cooldown period for the slash command, in seconds. */
  cooldown?: number;
  /** Whether the slash command is only available for development purposes. */
  development?: boolean;
  /** Whether the slash command is enabled in direct messages (DMs). */
  DMEnabled?: boolean;
  /** Whether the slash command is only available for developers. */
  DeveloperOnly?: boolean;
  /** Allows developers to bypass certain restrictions for the slash command during development. */
  DeveloperBypass?: boolean;
  /** Whether the slash command is meant for use in partnership-related contexts. */
  partner?: boolean;
  /** Groups associated with the slash command. */
  groups?: ApplicationCommandSubGroup;
  /** Subcommands associated with the slash command. */
  subcommands?: ApplicationCommandSubCommand;
  execute?: ({
    client,
    interaction,
  }: {
    client: GBF;
    interaction: CommandInteraction;
  }) => unknown;
}
