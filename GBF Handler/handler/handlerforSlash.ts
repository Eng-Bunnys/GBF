import { ApplicationCommandOptionType } from "discord.js";

interface GBFSlashOptions {
  name?: string;
  category?: string;
  description?: string;
  usage?: string;
  examples?: string;
  options?: any[];
  defaultPermission?: boolean;
  devOnly?: boolean;
  Partner?: boolean;
  devBypass?: boolean;
  userPermission?: string[];
  botPermission?: string[];
  cooldown?: number;
  development?: boolean;
  groups?: any;
  subcommands?: any;
}

class GBFSlash {
  readonly client: any;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly usage: string;
  readonly examples: string;
  readonly options: any[];
  readonly defaultPermission: boolean;
  readonly devOnly: boolean;
  readonly Partner: boolean;
  readonly devBypass: boolean;
  readonly userPermission: string[];
  readonly botPermission: string[];
  readonly cooldown: number;
  readonly development?: boolean;
  readonly groups?: any;
  readonly subcommands?: any;

  constructor(client: any, options: GBFSlashOptions) {
    this.client = client;
    this.name = options.name || "";
    this.category = options.category || "";
    this.description = options.description || "";
    this.usage = options.usage || "";
    this.examples = options.examples || "";
    this.options = options.options || [];
    this.defaultPermission = options.defaultPermission || true;
    this.devOnly = options.devOnly || false;
    this.Partner = options.Partner || false;
    this.devBypass = options.devBypass || false;
    this.userPermission = options.userPermission || [];
    this.botPermission = options.botPermission || [];
    this.cooldown = options.cooldown || 0;
    this.development = options.development;
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

export = GBFSlash;

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

function getSubcommandOptions(subcommands: any) {
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
