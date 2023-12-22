import {
  Client,
  ClientOptions,
  GatewayIntentBits,
  BitFieldResolvable,
  Collection,
} from "discord.js";
import { GBFUtils } from "../utils/GBF Utils";
import { IGBFClient } from "./types";
import { connect } from "mongoose";
import { MessageCommand } from "./Command Handlers/Message Handler";
import { RegisterCommands } from "./Command Handlers/Command Registry";
import { redBright, greenBright, blueBright } from "chalk";
import path from "path";

/**
 * GBF Handler
 * @class
 * @extends {Client}
 * @implements {IGBFClient}
 */
export class GBF extends Client implements IGBFClient {
  /**
   * The version of the command and event handler.
   * @readonly
   * @type {?string}
   */
  public readonly HandlerVersion?: string;

  /**
   * The folder where commands are located.
   * @readonly
   * @type {?string}
   */
  public readonly CommandsFolder?: string;

  /**
   * The folder where events are located.
   * @readonly
   * @type {?string}
   */
  public readonly EventsFolder?: string;

  /**
   * The default command prefix.
   * @readonly
   * @type {?string}
   */
  public readonly Prefix?: string;

  /**
   * An array of possible prefixes.
   * @readonly
   * @type {?string[]}
   */
  public readonly Prefixes?: string[];

  /**
   * Collection of message commands.
   * @readonly
   * @type {Collection<string, MessageCommand>}
   */
  public readonly MessageCommands: Collection<string, MessageCommand> =
    new Collection();

  /**
   * Collection of slash commands.
   * @readonly
   * @type {Collection<string, any>}
   */
  public readonly SlashCommands: Collection<string, any> = new Collection();

  /**
   * Collection of command aliases.
   * @readonly
   * @type {Collection<string, string>}
   */
  public readonly aliases: Collection<string, string> = new Collection();

  /**
   * Collection of events.
   * @readonly
   * @type {Collection<string, unknown>}
   */
  public readonly events: Collection<string, unknown> = new Collection();

  /**
   * Configuration object.
   * @readonly
   * @type {any}
   */
  public readonly config: any;

  /**
   * Intent bits for the client.
   * @readonly
   * @type {BitFieldResolvable<string, number>}
   */
  public readonly intents: BitFieldResolvable<string, number>;

  /**
   * Array of test servers.
   * @readonly
   * @type {string[]}
   */
  public readonly TestServers: string[];

  /**
   * Array of developer IDs.
   * @readonly
   * @type {string[]}
   */
  public readonly Developers: string[];

  /**
   * The channel for logs.
   * @readonly
   * @type {?string}
   */
  public readonly LogsChannel?: string;

  /**
   * Array of partner IDs.
   * @readonly
   * @type {string[]}
   */
  public readonly Partners?: string[];

  /**
   * The support server ID.
   * @readonly
   * @type {?string}
   */
  public readonly SupportServer?: string;

  /**
   * Array of help categories to be ignored.
   * @readonly
   * @type {string[]}
   */
  public readonly IgnoredHelpCategories?: string[];

  /**
   * The version of the bot.
   * @readonly
   * @type {string}
   */
  public readonly Version: string;

  /**
   * Array of disabled command names.
   * @readonly
   * @type {string[]}
   */
  public readonly DisabledCommands?: string[];

  /**
   * Flag indicating whether to log actions.
   * @readonly
   * @type {?boolean}
   */
  public readonly LogActions?: boolean;

  /**
   * Flag indicating whether to disable default commands.
   * @readonly
   * @type {?boolean}
   */
  public readonly DisableDefaultCommands?: boolean;

  /**
   * Flag indicating whether to allow DM commands.
   * @readonly
   * @type {?boolean}
   */
  public readonly DMCommands?: boolean;

  /**
   * Flag indicating whether to automatically login.
   * @readonly
   * @type {?boolean}
   */
  public readonly AutoLogin?: boolean;

  /**
   * Flag indicating whether to enable database interactions.
   * @readonly
   * @type {?boolean}
   */
  public readonly DatabaseInteractions?: boolean;

  /**
   * Constructs a new instance of the GBF class.
   * @constructor
   * @param {IGBFClient & ClientOptions} options - Options for the GBF client.
   */
  constructor(options: IGBFClient & ClientOptions) {
    super(options);

    const ConfigPath = options.config;
    const config = GBFUtils.loadConfig(ConfigPath);

    this.HandlerVersion = "5.0.0";
    this.CommandsFolder = options.CommandsFolder;
    this.EventsFolder = options.EventsFolder;
    this.Prefix = options.Prefix || "!!";
    this.Prefixes = options.Prefixes || [this.Prefix];
    this.config = config;
    this.intents = options.intents || [GatewayIntentBits.Guilds];
    this.TestServers = options.TestServers || [];
    this.Developers = options.Developers || [];
    this.LogsChannel = options.LogsChannel || "";
    this.Partners = options.Partners || [];
    this.SupportServer = options.SupportServer;
    this.Version = options.Version || "1.0.0";
    this.LogActions = options.LogActions || false;
    this.DMCommands = options.DMCommands || false;
    this.AutoLogin = options.AutoLogin || false;
    this.DatabaseInteractions =
      options.DatabaseInteractions !== undefined || options !== null
        ? options.DatabaseInteractions
        : true;

    if (this.AutoLogin) this.login();
    this.LoadEvents(path.join(__dirname, "./Handler Events"));
  }

  /**
   * Loads commands from the specified folder.
   * @private
   * @async
   * @param {string} folder - The folder path where commands are located.
   * @returns {Promise<void>}
   */
  private async LoadCommands(folder: string): Promise<void> {
    try {
      await RegisterCommands(this, folder);

      if (this.LogActions) {
        console.log(
          blueBright(
            `• Registered ${this.MessageCommands.size.toLocaleString(
              "en-US"
            )} Message Commands.`
          )
        );
      }
    } catch (error) {
      console.log(redBright(`Error loading commands: ${error}`));
    }
  }

  /**
   * Loads events from the specified folder.
   * @private
   * @async
   * @param {string} folder - The folder path where events are located.
   * @returns {Promise<void>}
   */
  private async LoadEvents(folder: string): Promise<void> {
    const EventFiles = GBFUtils.readFilesRecursively(folder, [".ts", ".js"]);

    for (const file of EventFiles) {
      try {
        const EventModule = await import(file);
        const EventFunction = EventModule.default || EventModule;

        if (typeof EventFunction !== "function") {
          throw new Error(`"${file}" does not have a callable export.`);
        }

        this.events.set(
          EventFunction.name,
          EventFunction as unknown as GlobalEventHandlers
        );

        await EventFunction(this, this.config);
      } catch (error) {
        console.log(redBright(`Error loading "${file}": ${error}`));
      }
    }
  }

  /**
   * Logs in the client with the provided token or the one from the configuration.
   * @async
   * @param {string} [token] - The bot token to use for login.
   * @returns {Promise<string>} - A promise resolving to a success message.
   */
  async login(token?: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const BotToken = token || this.config.TOKEN;

        if (this.AutoLogin && !BotToken) {
          reject(
            new Error(
              "Cannot manually login without a provided token when Auto Login is enabled."
            )
          );
          return;
        }

        if (this.EventsFolder) {
          try {
            await this.LoadEvents(this.EventsFolder);
          } catch (error) {
            console.log(redBright(`Error loading events: ${error}`));
          }
        }

        if (this.CommandsFolder) {
          try {
            await this.LoadCommands(this.CommandsFolder);
          } catch (err) {
            console.log(redBright(`Error loading commands: ${err}`));
          }
        }

        try {
          await super.login(BotToken);
        } catch (DiscordError) {
          console.error(
            redBright("Error during Discord login:", DiscordError.message)
          );
          reject(DiscordError);
          return;
        }

        if (this.config.MongoURI && this.DatabaseInteractions) {
          try {
            await connect(this.config.MongoURI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              useFindAndModify: false,
            });
            if (this.LogActions) {
              console.log(greenBright("• Connected to MongoDB successfully."));
            }
          } catch (MongoError) {
            console.error("Error connecting to MongoDB:", MongoError.message);
            reject(MongoError);
            return;
          }
        } else {
          console.warn(
            "MongoDB URI is not provided. No database interactions will occur.\nMake sure that the variable is named as MONGO_URI."
          );
        }

        resolve("Login successful!");
      } catch (error) {
        reject(error);
      }
    });
  }
}
