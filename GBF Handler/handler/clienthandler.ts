import { ApplicationCommandData, Client, Collection } from "discord.js";
import { connect } from "mongoose";
import { registerCommands } from "./registry";
import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { GBFSlash, GBFSlashOptions } from "./handlerforSlash";
import { CommandOptions } from "./commandhandler";

export default class GBFClient extends Client {
  public readonly commands: Collection<string, CommandOptions> =
    new Collection();
  public readonly slashCommands: Collection<string, GBFSlashOptions> =
    new Collection();
  public readonly buttonCommands: Collection<string, unknown> =
    new Collection();
  public readonly selectCmds: Collection<string, unknown> = new Collection();
  public readonly contextCmds: Collection<string, unknown> = new Collection();
  public readonly aliases: Collection<string, unknown> = new Collection();
  public readonly events: Collection<string, unknown> = new Collection();
  public readonly configs: any = require("../config/GBFconfig.json");

  constructor(options) {
    super(options);
  }

  public async loadCommands(): Promise<void> {
    if (!this.application?.owner) await this.application?.fetch();

    await registerCommands(this, "../commands");

    const guildCommands: ApplicationCommandData[] = toApplicationCommand(
      this.slashCommands.filter((s: GBFSlash) => s.development)
    );
    const globalCommands: ApplicationCommandData[] = toApplicationCommand(
      this.slashCommands.filter((s: GBFSlash) => !s.development)
    );

    if (guildCommands.length) {
      if (this.configs.TestGuilds.length > 0) {
        for (let i = 0; i < this.configs.TestGuilds.length; i++) {
          let testServer = await this.guilds.fetch(this.configs.TestGuilds[i]);
          await testServer.commands.set(guildCommands);
        }
      }
    }

    if (globalCommands.length) {
      await this.application.commands.set(globalCommands);
    }
  }

  public async loadEvents(): Promise<void> {
    const readEvents = (dir: string) => {
      const files = readdirSync(join(__dirname, dir));
      for (const file of files) {
        const stat = lstatSync(join(__dirname, dir, file));
        if (stat.isDirectory()) {
          readEvents(join(dir, file));
        } else {
          const eventModule = require(join(__dirname, dir, file));
          const eventFunction =
            typeof eventModule === "function"
              ? eventModule
              : eventModule.default;

          if (typeof eventFunction !== "function") {
            console.log(`"${file}" does not have a callable default export`);
            continue;
          }

          this.events.set(
            eventFunction.name,
            eventFunction as GlobalEventHandlers
          );
          eventFunction(this, this.configs);
        }
      }
    };

    readEvents("../events");
  }

  async login(token: string) {
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

function toApplicationCommand(collection) {
  return collection.map((s) => {
    return {
      name: s.name,
      description: s.description,
      options: s.options,
      defaultPermission: s.development ? false : true
    };
  });
}
