class GBFCmd {
  readonly client: any;
  readonly name: string;
  readonly aliases: string[];
  readonly category: string;
  readonly description: string;
  readonly usage: string;
  readonly examples: string;
  readonly cooldown: number;
  readonly userPermission: string[];
  readonly botPermission: string[];
  readonly devOnly: boolean;
  readonly development: boolean;
  readonly devBypass: boolean;
  readonly Partner: boolean;
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
      cooldown = 0,
      userPermission = [],
      botPermission = [],
      devOnly = false,
      devBypass = false,
      development = false,
      Partner = false,
      args = []
    }: {
      name?: string;
      aliases?: string[];
      category?: string;
      description?: string;
      usage?: string;
      examples?: string;
      cooldown?: number;
      userPermission?: string[];
      botPermission?: string[];
      devOnly?: boolean;
      devBypass?: boolean;
      development?: boolean;
      Partner?: boolean;
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
    this.cooldown = cooldown;
    this.userPermission = userPermission;
    this.botPermission = botPermission;
    this.devOnly = devOnly;
    this.devBypass = devBypass;
    this.development = development;
    this.Partner = Partner;
    this.args = args;
  }
}

export = GBFCmd;
