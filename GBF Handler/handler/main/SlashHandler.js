class GBFSlash {
  constructor(client) {
    this._client = client;
  }

  async getCommands(guildId) {
    let commands;

    if (guildId) {
      const guild = await this._client.guilds.fetch(guildId);
      commands = guild.commands;
    } else {
      commands = this._client.application.commands;
    }

    await commands.fetch();

    return commands;
  }

  async create(name, description, options, guildId) {
    const commands = await this.getCommands(guildId);

    const existingCommand = commands.cache.find((cmd) => cmd.name === name);
    if (existingCommand) {
      return console.log(`Command "${name}" because it already exists`);
    }

    await commands.create({
      name,
      description,
      options,
    });
  }

  async delete(commandName, guildId) {
    const commands = await this.getCommands(guildId);

    const existingCommand = commands.cache.find(
      (cmd) => cmd.name === commandName
    );

    if (!existingCommand) return;

    await existingCommand.delete();
  }
}

module.exports = GBFSlash;
