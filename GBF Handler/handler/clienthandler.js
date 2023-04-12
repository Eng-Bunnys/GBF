const { Client, Collection } = require("discord.js");
const { connect } = require("mongoose");
const { registerCommands } = require("./registry");
const { lstatSync, readdirSync } = require("fs");
const { join } = require("path");

class GBFClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.buttonCommands = new Collection();
    this.selectCmds = new Collection();
    this.contextCmds = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();
    this.configs = require("../config/GBFconfig.json");
  }

  async loadCommands() {
    if (!this.application?.owner) await this.application?.fetch();

    await registerCommands(this, "../commands");

    const guildCommands = toApplicationCommand(
      this.slashCommands.filter((s) => s.development),
      this
    );
    const globalCommands = toApplicationCommand(
      this.slashCommands.filter((s) => !s.development),
      this
    );

    if (guildCommands.length) {
      const TestServerMain = await this.guilds.fetch("");
      //guildCommands
      await TestServerMain.commands.set(guildCommands);
    } //globalCommands
    if (globalCommands.length)
      await this.application.commands.set(globalCommands);
  }

  async loadEvents() {
    const readEvents = (dir) => {
      const files = readdirSync(join(__dirname, dir));
      for (const file of files) {
        const stat = lstatSync(join(__dirname, dir, file));
        if (stat.isDirectory()) {
          readEvents(join(dir, file));
        } else {
          const event = require(join(__dirname, dir, file));
          if (typeof event !== "function") {
            console.log(`"${file}" does not have a "client" feature`);
          } else {
            this.events.set(event);
            event(this);
          }
        }
      }
    };

    readEvents("../events");
  }

  async login(token) {
    await connect(this.configs.MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    try {
      await this.loadEvents();
    } catch (e) {
      console.log(`Failed to load Events: ${e}`);
    }

    try {
      await super.login(token);
    } catch (e) {
      console.log(`Failed to login Error: ${e}`);
      process.exit(1);
    }

    try {
      await this.loadCommands();
    } catch (e) {
      console.log(`Error for loading commands: ${e.message}`);
    }

    return this.token;
  }
}

module.exports = GBFClient;

function toApplicationCommand(collection) {
  return collection.map((s) => {
    return {
      name: s.name,
      description: s.description,
      options: s.options,
      defaultPermission: s.devOnly ? false : s.defaultPermission
    };
  });
}
