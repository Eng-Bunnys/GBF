export interface CommandOptions {
  name: string;
  aliases?: string[];
  category: string;
  description: string;
  usage?: string;
  examples?: string;
  onHelpMenu?: boolean;
  cooldown?: number;
  userPermission?: string[];
  botPermission?: string[];
  devOnly?: boolean;
  devBypass?: boolean;
  development?: boolean;
  dmEnabled?: boolean;
  Partner?: boolean;
  args?: any[];
}

export class GBFCmd {
  readonly client: any;
  readonly name: string;
  readonly aliases: string[];
  readonly category: string;
  readonly description: string;
  readonly usage: string;
  readonly examples: string;
  readonly onHelpMenu: boolean;
  readonly cooldown: number;
  readonly userPermission: string[];
  readonly botPermission: string[];
  readonly devOnly: boolean;
  readonly development: boolean;
  readonly devBypass: boolean;
  readonly dmEnabled: boolean;
  readonly partner: boolean;
  readonly args: any[];

  constructor(
    client: any,
    {
      name = "",
      aliases = [],
      category = "",
      description = "",
      usage = "",
      examples = "",
      onHelpMenu = true,
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
      usage?: string;
      examples?: string;
      onHelpMenu?: boolean;
      cooldown?: number;
      userPermission?: string[];
      botPermission?: string[];
      devOnly?: boolean;
      devBypass?: boolean;
      development?: boolean;
      dmEnabled?: boolean;
      partner?: boolean;
      args?: any[];
    }
  ) {
    this.client = client;
    this.name = name;
    this.aliases = aliases;
    this.category = category;
    this.description = description;
    this.usage = usage;
    this.examples = examples;
    this.onHelpMenu = onHelpMenu || true;
    this.cooldown = cooldown;
    this.userPermission = userPermission;
    this.botPermission = botPermission;
    this.devOnly = devOnly || false;
    this.devBypass = devBypass || false;
    this.development = development || false;
    this.dmEnabled = dmEnabled || false;
    this.partner = partner || false;
    this.args = args;
  }
}
