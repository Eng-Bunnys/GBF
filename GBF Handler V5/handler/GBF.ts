import {
  Client,
  ClientOptions,
  GatewayIntentBits,
  BitFieldResolvable,
  Collection,
} from "discord.js";
import HandlerInfo from "./Handler Info.json";
import { GBFUtils } from "../utils/GBF Utils";
import { IGBFClient } from "./types";
import { connect } from "mongoose";

export default class GBF extends Client implements IGBFClient {
  public readonly HandlerVersion?: string;
  public readonly CommandsFolder?: string;
  public readonly EventsFolder?: string;
  public readonly Prefix?: string;
  public readonly Prefixes?: string[];
  public readonly commands: Collection<string, any> = new Collection();
  public readonly slashCommands: Collection<string, any> = new Collection();
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
  public readonly AutoLogin?: boolean;

  constructor(options: IGBFClient & ClientOptions) {
    super(options);

    const ConfigPath = options.config;
    const config = GBFUtils.loadConfig(ConfigPath);

    this.HandlerVersion = HandlerInfo.Version;
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

    if (this.AutoLogin) this.login();

    if (options.EventsFolder) {
      const isEventsFolderValid = GBFUtils.isDirectory(options.EventsFolder);

      if (!isEventsFolderValid) {
        console.error(
          `Fatal Error: Incorrect events folder path specified: ${options.EventsFolder}`
        );
        process.exit(1);
      }

      const files = GBFUtils.readFilesRecursively(options.EventsFolder, [
        ".js",
        ".ts",
      ]);

      console.log(`Files in Events Folder (${options.EventsFolder}):`);
      files.forEach((file) => {
        console.log(file);
      });
    }
  }

  /**
   * Logs in the bot using a Discord token.
   * @param token - Optional token to override the configured token
   * @returns A promise that resolves to a success message
   * @throws If there is an error during login
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

        try {
          await super.login(BotToken);
          console.log("Discord login successful.");
        } catch (DiscrodError) {
          console.error("Error during Discord login:", DiscrodError.message);
          reject(DiscrodError);
          return;
        }

        if (this.config.MongoURI) {
          try {
            await connect(this.config.MongoURI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              useFindAndModify: false,
            });
            console.log("Connected to MongoDB successfully.");
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
