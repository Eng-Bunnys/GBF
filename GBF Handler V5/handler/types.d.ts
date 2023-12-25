import { GatewayIntentBits, BitFieldResolvable } from "discord.js";

export interface BotConfig {
  apiKey: string;
  botToken: string;
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
  config?: any;
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
  userPermission?: bigint[];
  /** Required bot permissions for the command to function properly. */
  botPermission?: bigint[];
  /** Whether the command is only available for development purposes. */
  devOnly?: boolean;
  /** Allows developers to bypass certain restrictions for the command during development. */
  devBypass?: boolean;
  /** Whether the command registers globally or in development only servers. */
  development?: boolean;
  /** Whether the command is enabled in direct messages (DMs). */
  dmEnabled?: boolean;
  /** Whether the command is meant for use in partnership-related contexts. */
  partner?: boolean;
  /** Expected arguments for the command (array of strings or undefined if no arguments are required). */
  args?: T;
}