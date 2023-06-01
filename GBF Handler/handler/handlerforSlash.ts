import {
  ApplicationCommandOptionType,
  ApplicationCommandOptionData,
  CommandInteraction
} from "discord.js";
import GBFClient from "./clienthandler";

interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export interface SubcommandData {
  description: string;
  args?: ApplicationCommandOptionData[];
  execute?: ({ client, interaction }: IExecute) => unknown;
}

export interface GBFSlashOptions {
  name: string;
  category: string;
  description: string;
  NSFW?: boolean;
  usage?: string;
  examples?: string;
  options?: ApplicationCommandOptionData[];
  defaultPermission?: boolean;
  devOnly?: boolean;
  partner?: boolean;
  devBypass?: boolean;
  userPermission?: string | bigint[];
  botPermission?: string | bigint[];
  cooldown?: number;
  development?: boolean;
  dmEnabled?: boolean;
  groups?: any;
  subcommands?: Record<string, SubcommandData>;
}

export class GBFSlash {
  readonly client: any;
  readonly name: string;
  readonly category: string;
  readonly description: string;
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

  constructor(client: any, options: GBFSlashOptions) {
    this.client = client;
    this.name = options.name || "";
    this.category = options.category || "";
    this.description = options.description || "";
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
    this.dmEnabled = options.dmEnabled || false;
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
      type: ApplicationCommandOptionType.SubcommandGroup
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
      type: ApplicationCommandOptionType.Subcommand
    };

    options.push(option);
  }

  return options;
}
