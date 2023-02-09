class GBFSlash {

  constructor(client, {
    name = "",
    category = "",
    description = "",
    usage = "",
    examples = "",
    options = [],
    defaultPermission = true,
    devOnly = false,
    userPermission = [],
    botPermission = [],
    cooldown = 0,
    development,
    Partner = false,
    groups = null,
    subcommands = null
  }) {
    this.client = client;
    this.name = name;
    this.category = category;
    this.description = description;
    this.usage = usage;
    this.examples = examples;
    this.options = options;
    this.defaultPermission = defaultPermission;
    this.devOnly = devOnly;
    this.userPermission = userPermission;
    this.botPermission = botPermission;
    this.cooldown = cooldown;
    this.development = development;
    this.Partner = Partner;
    this.groups = groups;
    this.subcommands = subcommands;

    if (options && options.length) this.options = options;
    else if (groups && Object.keys(groups)) this.options = getSubcommandGroupOptions(this.groups);
    else if (subcommands && Object.keys(subcommands)) this.options = getSubcommandOptions(this.subcommands);
  }

}

module.exports = GBFSlash;

function getSubcommandGroupOptions(groups) {
  const names = Object.keys(groups);
  const options = [];

  for (const name of names) {
    const option = {
      name,
      description: groups[name].description,
      options: getSubcommandOptions(groups[name].subcommands),
      userPermission: groups[name].userPermission,
      botPermission: groups[name].botPermission,
      type: "SUB_COMMAND_GROUP"
    }

    options.push(option);
  }

  return options;
}


function getSubcommandOptions(subcommands) {
  const names = Object.keys(subcommands);
  const options = [];

  for (const name of names) {
    const option = {
      name,
      description: subcommands[name].description,
      options: subcommands[name].args,
      userPermission: subcommands[name].userPermission,
      botPermission: subcommands[name].botPermission,
      type: "SUB_COMMAND"
    }

    options.push(option);
  }

  return options;
}