import GBFClient from "./clienthandler";

/**
 * Options for defining a command.
 */
export interface CommandOptions {
  /** The unique name of the command. */
  name: string;
  /** Aliases for the command. */
  aliases?: string[];
  /** The category to which the command belongs. */
  category: string;
  /** A brief description of what the command does. */
  description: string;
  /** Whether the command is NSFW (Not Safe For Work). */
  NSFW?: boolean;
  /** Usage instructions for the command. */
  usage?: string;
  /** Examples demonstrating the usage of the command. */
  examples?: string;
  /** Cooldown time for the command in seconds. */
  cooldown?: number;
  /** The user permissions required to execute the command. */
  userPermission?: string | bigint[];
  /** The bot permissions required for the command to function. */
  botPermission?: string | bigint[];
  /** Whether the command is restricted to developers only. */
  devOnly?: boolean;
  /** Whether developers bypass the command cooldown. */
  devBypass?: boolean;
  /** Whether the command is for development purposes only. */
  development?: boolean;
  /** Whether the command can be used in direct messages. */
  dmEnabled?: boolean;
  /** Whether the command is only available to bot partners. */
  partner?: boolean;
  /** Additional arguments for the command. */
  args?: string[];
}

/**
 * Represents a command in the bot.
 */
export class GBFCmd {
  /** The bot client associated with the command. */
  readonly client: any;
  /** The unique name of the command. */
  readonly name: string;
  /** Aliases for the command. */
  readonly aliases: string[];
  /** The category to which the command belongs. */
  readonly category: string;
  /** A brief description of what the command does. */
  readonly description: string;
  /** Whether the command is NSFW (Not Safe For Work). */
  readonly NSFW: boolean;
  /** Usage instructions for the command. */
  readonly usage: string;
  /** Examples demonstrating the usage of the command. */
  readonly examples: string;
  /** Cooldown time for the command in seconds. */
  readonly cooldown: number;
  /** The user permissions required to execute the command. */
  readonly userPermission: string | bigint[];
  /** The bot permissions required for the command to function. */
  readonly botPermission: string | bigint[];
  /** Whether the command is restricted to developers only. */
  readonly devOnly: boolean;
  /** Whether developers bypass the command cooldown. */
  readonly devBypass: boolean;
  /** Whether the command is for development purposes only | Enabled in development servers only. */
  readonly development: boolean;
  /** Whether the command can be used in direct messages. */
  readonly dmEnabled: boolean;
  /** Whether the command is only available to bot partners. */
  readonly partner: boolean;
  /** Additional arguments for the command. */
  readonly args: string[];

  /**
   * Creates an instance of the GBFCmd class.
   * @param {GBFClient} client - The bot client.
   * @param {CommandOptions} options - Options for defining the command.
   */
  constructor(client: GBFClient, options: CommandOptions) {
    this.client = client;
    Object.assign(this, options);
    this.NSFW = this.NSFW || false;
    this.devOnly = this.devOnly || false;
    this.development = this.development || false;
    this.dmEnabled = this.dmEnabled || false;
    this.partner = this.partner || false;
    this.args = this.args || [];
  }
}
