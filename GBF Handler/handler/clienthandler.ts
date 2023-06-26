import {
  ApplicationCommandData,
  Client,
  ClientOptions,
  Collection,
  BitFieldResolvable,
  Guild,
  GatewayIntentBits
} from "discord.js";

import { connect } from "mongoose";
import { registerCommands } from "./registry";
import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { GBFSlash, GBFSlashOptions } from "./handlerforSlash";
import { CommandOptions } from "./commandhandler";

export interface IGBFClient {
  /**The location of your commands folder Eg. ../../commands */
  CommandsFolder: string;
  /**The location of your commands folder Eg. ../../events */
  EventsFolder: string;
  /**Log handler events like when your commands register etc. */
  LogActions?: boolean;
  /**Your bot's default prefix */
  Prefix: string;
  /**An array that contains all of the bot's developer's IDs */
  Developers?: string[];
  /**The location of your config folder Eg. path.join(__dirname, "./config/GBFconfig.json") */
  config?: any;
  /**The bot's intents */
  intents: BitFieldResolvable<string, number>;
  /**An array that contains all of the test servers that get the development commands */
  TestServers?: string[];
  /**A channel to log important bot activity like bot user bans */
  LogsChannel?: string;
  /**An array that contains all of your bot's partners */
  Partners?: string[];
  /**A URL to your bot's support server */
  SupportServer?: string;
  /**Ignored help categories that won't be displayed */
  IgnoredHelpCategories?: string[];
  /**Your bot's version Default: 1.0.0 */
  Version?: string;
  /**An array that contains all of the disabled commands, case sensitive */
  DisabledCommands?: string[];
  /**A boolean that disables / enables the default bot commands */
  DisableDefaultCommands?: boolean;
  /**A boolean that sets whether the bot's commands can be ran in DMs or not Default: false */
  DMCommands?: boolean;
}

export enum DefaultCommands {
  BotBan = "bot-ban",
  EventSim = "simulate",
  HelpMenu = "help"
}

export default class GBFClient extends Client implements IGBFClient {
  public readonly CommandsFolder: string;
  public readonly EventsFolder: string;
  public readonly Prefix: string;
  public readonly commands: Collection<string, CommandOptions> =
    new Collection();
  public readonly slashCommands: Collection<string, GBFSlashOptions> =
    new Collection();
  public readonly aliases: Collection<string, unknown> = new Collection();
  public readonly events: Collection<string, unknown> = new Collection();
  public readonly config: any;
  public readonly intents: BitFieldResolvable<string, number>;
  public readonly TestServers: string[];
  public readonly Developers: string[];
  public readonly LogsChannel?: string;
  public readonly Partners?: string[];
  public readonly SupportServer?: string;
  public readonly IgnoredHelpCategories?: string[];
  public readonly Version: string;
  public readonly DisabledCommands?: string[];
  public readonly LogActions?: boolean;
  public readonly DisableDefaultCommands?: boolean;
  public readonly DMCommands?: boolean;

  constructor(options: IGBFClient & ClientOptions) {
    super(options);
    this.CommandsFolder = options.CommandsFolder;
    this.EventsFolder = options.EventsFolder;
    this.Prefix = options.Prefix || "!!";
    this.config = require(options.config);
    this.intents = options.intents || [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildWebhooks
    ];
    this.TestServers = options.TestServers || [];
    this.Developers = options.Developers || [];
    this.LogsChannel = options.LogsChannel || "";
    this.Partners = options.Partners || [];
    this.SupportServer = options.SupportServer;
    this.IgnoredHelpCategories = options.IgnoredHelpCategories;
    this.Version = options.Version || "1.0.0";
    this.DisabledCommands = options.DisabledCommands || [];
    this.LogActions = options.LogActions || false;
    this.DisableDefaultCommands = options.DisableDefaultCommands || false;
    this.DMCommands = options.DMCommands || false;
  }

  public async loadCommands(): Promise<void> {
    if (!this.application?.owner) await this.application?.fetch();

    await registerCommands(this, this.CommandsFolder);

    if (this.DisableDefaultCommands)
      await registerCommands(this, "./Default Commands");

    const guildCommands: ApplicationCommandData[] = toApplicationCommand(
      this.slashCommands.filter(
        (s: GBFSlash) =>
          s.development && !this.DisabledCommands?.includes(s.name)
      )
    );

    const globalCommands: ApplicationCommandData[] = toApplicationCommand(
      this.slashCommands.filter(
        (s: GBFSlash) =>
          !s.development && !this.DisabledCommands?.includes(s.name)
      )
    );

    if (this.LogActions)
      for (let j = 0; j < this.DisabledCommands.length; j++)
        console.log(`Will not register: ${this.DisabledCommands[j]}`);

    if (guildCommands.length && this.TestServers.length > 0) {
      await Promise.all(
        this.TestServers.map(async (serverId) => {
          const testServer = await this.guilds.fetch(serverId);
          if (testServer instanceof Guild) {
            await testServer.commands.set(guildCommands);
            if (this.LogActions) {
              console.log(
                `Registering Guild Only Commands in: ${testServer.name}`
              );
            }
          }
        })
      );
    }

    if (globalCommands.length) {
      await this.application.commands.set(globalCommands);
      if (this.LogActions)
        console.log(`Registered ${globalCommands.length} global commands`);
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
          eventFunction(this, this.config);
        }
      }
    };

    readEvents(this.EventsFolder);
    readEvents("./Handler Events");
  }

  async login(token: string) {
    await connect(this.config.MONGOURI, {
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
      defaultPermission: s.development ? false : true,
      type: s.type,
      dm_permission: s.dmEnabled,
      nsfw: s.NSFW
    };
  });
}
