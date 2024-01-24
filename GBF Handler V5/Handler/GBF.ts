import {
  ApplicationCommandData,
  ApplicationCommandType,
  BitFieldResolvable,
  Client,
  ClientOptions,
  Collection,
  GatewayIntentBits,
  Guild,
} from "discord.js";
import { redBright, greenBright, blueBright, magentaBright } from "chalk";
import { AppConfig, IGBF, IgnoreEvents } from "./types";
import { Engine } from "../Utils/Engine";
import { MessageCommand } from "./Command Handlers/Message Handler";
import { RegisterCommands } from "./Command Handlers/Command Registry";
import path from "path";
import { connect } from "mongoose";
import { SlashCommand } from "./Command Handlers/Slash Handler";

export class GBF extends Client implements IGBF {
  private HandlerVersion: string;
  public readonly LogActions?: boolean;
  private LogActionsMessage: string = "";
  public readonly HandlerEvents: Collection<string, Function> =
    new Collection();
  public readonly Aliases: Collection<string, string> = new Collection();

  public readonly EventsFolder?: string;
  public readonly IgnoredEvents?: IgnoreEvents;

  public readonly CommandsFolder?: string;
  public readonly MessageCommands: Collection<string, MessageCommand> =
    new Collection();
  public readonly SlashCommands: Collection<string, SlashCommand> =
    new Collection();

  public readonly BotConfig?: AppConfig;
  public readonly intents:
    | GatewayIntentBits[]
    | BitFieldResolvable<string, number>;
  public readonly Prefix?: string;
  public readonly Prefixes?: string[];
  public readonly DMEnabled?: boolean;
  public readonly Developers?: string[];
  public readonly TestServers?: string[];
  public readonly SupportServer?: string;
  public readonly Version?: string;
  constructor(HandlerOptions: ClientOptions & IGBF) {
    super(HandlerOptions);

    const ConfigPath = HandlerOptions.BotConfig;
    const Config = Engine.LoadConfig(ConfigPath as string);

    this.BotConfig = Config;
    if (HandlerOptions.AutoLogin) this.login();

    this.intents = (HandlerOptions.intents as Array<GatewayIntentBits>)
      ?.length || [GatewayIntentBits.Guilds];

    this.EventsFolder = HandlerOptions.EventsFolder;
    this.CommandsFolder = HandlerOptions.CommandsFolder;
    this.IgnoredEvents = HandlerOptions.IgnoredEvents ?? [];

    this.Prefix = HandlerOptions.Prefix ?? "!!";
    this.Prefixes = HandlerOptions.Prefixes ?? [this.Prefix];
    this.HandlerVersion = "5.0.0";
    this.LogActions = HandlerOptions.LogActions;
    this.DMEnabled = HandlerOptions.DMEnabled ?? false;
    this.TestServers = HandlerOptions.TestServers ?? [];
    this.Developers = HandlerOptions.Developers ?? [];
    this.SupportServer = HandlerOptions.SupportServer ?? "No Support Server.";
    this.Version = HandlerOptions.Version ?? "1.0.0";

    this.LogActionsMessage += greenBright(
      `• GBF Handler v${this.HandlerVersion} is now online!`
    );

    this.LoadEvents(path.join(__dirname, "./Handler Events"), true);
  }

  private async LoadCommands(CommandsFolder: string): Promise<void> {
    try {
      if (!this.application?.owner) await this.application.fetch();

      await RegisterCommands(this, CommandsFolder);

      this.LogActionsMessage += blueBright(
        `\n• Registered ${this.MessageCommands.size.toLocaleString(
          "en-US"
        )} Message Command${this.MessageCommands.size > 1 ? "s." : "."}`
      );

      const GuildCommands: ApplicationCommandData[] = this.ToApplicationCommand(
        this.SlashCommands.filter((Command: SlashCommand) => {
          return Command.CommandOptions.development;
        })
      );

      const GlobalCommands: ApplicationCommandData[] =
        this.ToApplicationCommand(
          this.SlashCommands.filter((Command: SlashCommand) => {
            return !Command.CommandOptions.development;
          })
        );

      if (
        GuildCommands &&
        GuildCommands.length &&
        this.TestServers.length > 0
      ) {
        await Promise.all(
          this.TestServers.map(async (ServerID) => {
            const TestServer = await this.guilds.fetch(ServerID);
            if (TestServer && TestServer instanceof Guild)
              await TestServer.commands.set(GuildCommands).then(() => {
                this.LogActionsMessage += magentaBright(
                  `\n• Registering Guild Only Commands in: ${TestServer.name}`
                );
              });
          })
        );
      }

      if (GlobalCommands && GlobalCommands.length) {
        await this.application.commands.set(GlobalCommands);

        this.LogActionsMessage += magentaBright(
          `\n• Registered ${GlobalCommands.length} Global Command${
            GlobalCommands.length > 1 ? "s." : "."
          }`
        );
      }
    } catch (CommandSetError) {
      console.log(redBright(`Error Setting Commands\n${CommandSetError}`));
    }
  }

  private async LoadEvents(
    EventsFolder: string,
    SkipChecks: boolean
  ): Promise<void> {
    const EventFiles = Engine.ReadFiles(EventsFolder, [".ts", ".js"]);

    for (const File of EventFiles) {
      try {
        const EventModule = await import(File);

        type EventHandler = (
          arg: typeof this,
          config: typeof this.BotConfig
        ) => void;

        let EventFunction: EventHandler = EventModule.default
          ? EventModule.default
          : Object.values(EventModule)[0];

        if (typeof EventFunction !== "function")
          throw new Error(
            redBright(`• "${File}" does not have a callable export.`)
          );

        if (!SkipChecks) {
          if (this.IgnoredEvents === "All") {
            this.LogActionsMessage += blueBright(
              "\n• Will not register events."
            );
            return;
          }

          const LowerFunctionName = EventFunction.name.toLowerCase();
          const IgnoredNamesLower =
            Array.isArray(this.IgnoredEvents) &&
            this.IgnoredEvents.map((EventName) => EventName.toLowerCase());

          if (
            Array.isArray(IgnoredNamesLower) &&
            IgnoredNamesLower.includes(LowerFunctionName)
          ) {
            this.LogActionsMessage += blueBright(
              `\n• Ignoring event: ${EventFunction.name}`
            );
            continue;
          }
        }

        this.HandlerEvents.set(EventFunction.name, EventFunction);

        EventFunction(this, this.BotConfig);
      } catch (EventLoadError) {
        console.log(
          redBright(`• Event Load Error in "${File}"\n${EventLoadError}`)
        );
      }
    }
  }

  async login(ProvidedToken?: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const BotToken = ProvidedToken ?? this.BotConfig.TOKEN;

        try {
          await super.login(BotToken);
        } catch (LoginError) {
          console.log(redBright(`• Could not login.\n${LoginError}`));
          reject(LoginError);
          return;
        }

        if (this.BotConfig.MongoURI) {
          try {
            await connect(this.BotConfig.MongoURI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              useFindAndModify: false,
            });

            this.LogActionsMessage += greenBright(
              "\n• Connected to MongoDB successfully."
            );
          } catch (MongoError) {
            console.error("Error connecting to MongoDB:", MongoError.message);
            reject(MongoError);
            return;
          }
        } else {
          console.warn(
            "MongoDB URI is not provided. No database interactions will occur.\nMake sure that the variable is named as MongoURI."
          );
        }

        if (this.CommandsFolder) {
          try {
            await this.LoadCommands(this.CommandsFolder);
          } catch (CommandsError) {
            console.log(
              redBright(`• Error Loading Commands\n${CommandsError}`)
            );
          }
        }

        if (this.EventsFolder) {
          try {
            await this.LoadEvents(this.EventsFolder, false);
          } catch (EventsError) {
            console.log(redBright(`• Erroring Loading Events\n${EventsError}`));
          }
        }

        if (this.LogActions) console.log(this.LogActionsMessage);

        resolve("Login Successful!");
      } catch (LoginError) {
        reject(LoginError);
      }
    });
  }

  private ToApplicationCommand(
    SlashCommands: Collection<string, SlashCommand>
  ) {
    return SlashCommands.map((command) => {
      const CommandData = {
        name: command.CommandOptions.name,
        description: command.CommandOptions.description,
        options: command.CommandOptions.options || [],
        defaultMemberPermissions: command.CommandOptions.UserPermissions || [],
        defaultPermission: command.CommandOptions.development || false,
        dmPermission: command.CommandOptions.DMEnabled || this.DMEnabled,
        nsfw: command.CommandOptions.NSFW || false,
        type: !command.CommandOptions.ContextType
          ? ApplicationCommandType.ChatInput
          : command.CommandOptions.ContextType,
      };

      return CommandData;
    });
  }
}
