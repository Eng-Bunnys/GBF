class GBFSlash {
  constructor(client) {
    this._client = client;
  }

  async getCommands(guildId) {
    let commands;

    if (guildId) {
      const fetchedGuild = await this._client.guilds.fetch(guildId);
      commands = fetchedGuild.commands;
    } else {
      commands = this._client.application.commands;
    }

    await commands.fetch();
    return commands;
  }

  async create(name, description, options, guildId) {
    const commands = await this.getCommands(guildId);

    const existingCommands = commands.cache.find((cmd) => cmd.name === name);

    if (existingCommands) return; //Update slash command coming soon

    await commands.create({
        name,
        description,
        options,
    })

  }
}
module.exports = GBFSlash;
