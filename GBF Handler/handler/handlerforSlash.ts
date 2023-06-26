import {
  ApplicationCommandOptionType,
  ApplicationCommandOptionData,
  CommandInteraction,
  ApplicationCommandType
} from "discord.js";
import GBFClient from "./clienthandler";

export interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export interface SubcommandData {
  description: string;
  args?: ApplicationCommandOptionData[];
  execute?: ({ client, interaction }: IExecute) => unknown;
}

export interface GBFSlashOptions {
  /** The command's name [Required] */
  name: string;
  /** The command's category */
  category?: string;
  /** The command's description [Required] */
  description: string;
  /** Set the command to NSFW channels only */
  /** Specfiy the type of interaction, set to 1 by default */
  type?:
    | ApplicationCommandType.User
    | ApplicationCommandType.Message
    | ApplicationCommandType.ChatInput;
  NSFW?: boolean;
  /** Usage doc */
  usage?: string;
  /** Example of how to use it */
  examples?: string;
  /** Command Options */
  options?: ApplicationCommandOptionData[];
  defaultPermission?: boolean;
  /** Only developers can use this command */
  devOnly?: boolean;
  /** Only partners can use this command */
  partner?: boolean;
  /** Developers bypass the cooldown */
  devBypass?: boolean;
  /** The permissions that the user needs to run the command */
  userPermission?: string | bigint[];
  /** The permissions that the bot needs to execute the command */
  botPermission?: string | bigint[];
  /** The command cooldown in seconds */
  cooldown?: number;
  /** Test Server Only command */
  development?: boolean;
  /** If the command can be used in DMs */
  dmEnabled?: boolean;
  groups?: any;
  subcommands?: Record<string, SubcommandData>;
}

export class GBFSlash {
  readonly client: any;
  readonly name: string;
  readonly category?: string;
  readonly description: string;
  readonly type?:
    | ApplicationCommandType.User
    | ApplicationCommandType.Message
    | ApplicationCommandType.ChatInput;
  readonly NSFW: boolean;
  readonly usage: string;
  readonly examples: string;
  readonly options: ApplicationCommandOptionData[];
  readonly defaultPermission: boolean;
  readonly devOnly: boolean;
  readonly partner: boolean;
  readonly devBypass: boolean;
  readonly userPermission: string | bigint[];
  readonly botPermission: string | bigint[];
  readonly cooldown: number;
  readonly development?: boolean;
  readonly dmEnabled?: boolean;
  readonly groups?: any;
  readonly subcommands?: any;

  constructor(client: GBFClient, options: GBFSlashOptions) {
    this.client = client;
    this.name = options.name || "";
    this.category = options.category || "";
    this.description = options.description || "";
    this.type = options.type || ApplicationCommandType.ChatInput;
    this.NSFW = options.NSFW || false;
    this.usage = options.usage || "";
    this.examples = options.examples || "";
    this.options = options.options || [];
    this.defaultPermission = options.defaultPermission || true;
    this.devOnly = options.devOnly || false;
    this.partner = options.partner || false;
    this.devBypass = options.devBypass || false;
    this.userPermission = options.userPermission || [];
    this.botPermission = options.botPermission || [];
    this.cooldown = options.cooldown || 0;
    this.development = options.development || false;
    this.dmEnabled = options.dmEnabled || client.DMCommands;
    this.groups = options.groups ?? null;
    this.subcommands = options.subcommands ?? null;

    if (this.options.length === 0) {
      if (this.groups != null)
        this.options = getSubcommandGroupOptions(this.groups);
      else if (this.subcommands != null)
        this.options = getSubcommandOptions(this.subcommands);
    }
  }
}

function getSubcommandGroupOptions(groups: any) {
  const names = Object.keys(groups);
  const options = [];

  for (const name of names) {
    const option = {
      name,
      description: groups[name].description,
      options: getSubcommandOptions(groups[name].subcommands),
      userPermission: groups[name].userPermission,
      botPermission: groups[name].botPermission,
      type: ApplicationCommandOptionType.SubcommandGroup,
      nsfw: groups[name].NSFW,
      dm_permission: groups[name].dmEnabled
    };

    options.push(option);
  }

  return options;
}

function getSubcommandOptions(subcommands: {
  name: string;
  description: string;
  options: any;
}) {
  const names = Object.keys(subcommands);
  const options = [];

  for (const name of names) {
    const option = {
      name,
      description: subcommands[name].description,
      options: subcommands[name].args,
      userPermission: subcommands[name].userPermission,
      botPermission: subcommands[name].botPermission,
      type: ApplicationCommandOptionType.Subcommand,
      nsfw: subcommands[name].NSFW,
      dm_permission: subcommands[name].dmEnabled
    };

    options.push(option);
  }

  return options;
}
