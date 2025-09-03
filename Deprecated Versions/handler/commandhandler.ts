import GBFClient from "./clienthandler";

export interface CommandOptions {
  name: string;
  aliases?: string[];
  category: string;
  description: string;
  NSFW?: boolean;
  usage?: string;
  examples?: string;
  cooldown?: number;
  userPermission?: string | bigint[];
  botPermission?: string | bigint[];
  devOnly?: boolean;
  devBypass?: boolean;
  development?: boolean;
  dmEnabled?: boolean;
  partner?: boolean;
  args?: string[];
}

export class GBFCmd {
  readonly client: GBFClient;
  readonly name: string;
  readonly aliases: string[];
  readonly category: string;
  readonly description: string;
  readonly NSFW: boolean;
  readonly usage: string;
  readonly examples: string;
  readonly cooldown: number;
  readonly userPermission: string | bigint[];
  readonly botPermission: string | bigint[];
  readonly devOnly: boolean;
  readonly development: boolean;
  readonly devBypass: boolean;
  readonly dmEnabled: boolean;
  readonly partner: boolean;
  readonly args: string[];

  constructor(
    client: GBFClient,
    {
      name = "",
      aliases = [],
      category = "",
      description = "",
      NSFW = false,
      usage = "",
      examples = "",
      cooldown = 0,
      userPermission = [],
      botPermission = [],
      devOnly = false,
      devBypass = false,
      development = false,
      dmEnabled = false,
      partner = false,
      args = []
    }: {
      name?: string;
      aliases?: string[];
      category?: string;
      description?: string;
      NSFW?: boolean;
      usage?: string;
      examples?: string;
      cooldown?: number;
      userPermission?: string | bigint[];
      botPermission?: string | bigint[];
      devOnly?: boolean;
      devBypass?: boolean;
      development?: boolean;
      dmEnabled?: boolean;
      partner?: boolean;
      args?: string[];
    }
  ) {
    this.client = client;
    this.name = name;
    this.aliases = aliases;
    this.category = category;
    this.description = description;
    this.NSFW = NSFW || false;
    this.usage = usage;
    this.examples = examples;
    this.cooldown = cooldown;
    this.userPermission = userPermission || [];
    this.botPermission = botPermission || [];
    this.devOnly = devOnly || false;
    this.devBypass = devBypass || false;
    this.development = development || false;
    this.dmEnabled = dmEnabled || false;
    this.partner = partner || false;
    this.args = args;
  }
}