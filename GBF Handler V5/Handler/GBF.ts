import {
  ApplicationCommandData,
  ApplicationCommandType,
  BitFieldResolvable,
  Client,
  ClientOptions,
  Collection,
  GatewayIntentBits,
  Guild,
  REST,
  Routes,
  Snowflake,
} from "discord.js";
import {
  redBright,
  greenBright,
  blueBright,
  magentaBright,
  yellowBright,
} from "chalk";
import {
  AppConfig,
  BuiltInCommands,
  BuiltInEvents,
  IGBF,
  IgnoreEvents,
} from "./types";
import { Engine } from "../Utils/Engine";
import { MessageCommand } from "./Command Handlers/Message Handler";
import { RegisterCommands } from "./Command Handlers/Command Registry";
import path from "path";
import { connect } from "mongoose";
import { SlashCommand } from "./Command Handlers/Slash Handler";
import { IsValidURL } from "../Utils/Utils";

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
  public readonly AppealURL?: string;
  public readonly Version?: string;
  public readonly LogsChannel?: Snowflake[];
  public readonly DisabledHandlerEvents?: BuiltInEvents[];
  public readonly DisabledHandlerCommands?: BuiltInCommands[];
  public readonly DisabledCommands?: string[];
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
    this.AppealURL = HandlerOptions.AppealURL ?? undefined;
    this.Version = HandlerOptions.Version ?? "1.0.0";
    this.LogsChannel = HandlerOptions.LogsChannel ?? [];
    this.DisabledHandlerEvents = HandlerOptions.DisabledHandlerEvents ?? [];
    this.DisabledHandlerCommands = HandlerOptions.DisabledHandlerCommands ?? [];
    this.DisabledCommands = HandlerOptions.DisabledCommands ?? [];

    if (this.DisabledCommands.length)
      this.DisabledCommands = this.DisabledCommands.map((Command) =>
        Command.toLowerCase()
      );

    if (this.AppealURL && !IsValidURL(this.AppealURL)) {
      console.warn(
        yellowBright(`• Warning: The Appeal URL provided is not a valid URL.`)
      );
      this.AppealURL = undefined;
    }

    this.LogActionsMessage += greenBright(
      `• GBF Handler v${this.HandlerVersion} is now online!`
    );
  }

  private async LoadCommands(
    CommandsFolder: string,
    HandlerCommands: boolean = false
  ): Promise<void> {
    try {
      if (!this.application?.owner) await this.application.fetch();

      await RegisterCommands(this, CommandsFolder);

      if (this.MessageCommands.size >= 1 && !HandlerCommands)
        this.LogActionsMessage += blueBright(
          `\n• Registered ${this.MessageCommands.size.toLocaleString(
            "en-US"
          )} Message Command${this.MessageCommands.size > 1 ? "s." : "."}`
        );

      const GuildCommands: ApplicationCommandData[] = this.ToApplicationCommand(
        this.SlashCommands.filter((Command: SlashCommand) => {
          return (
            Command.CommandOptions.development &&
            !this.DisabledHandlerCommands.includes(
              Command.CommandOptions.name as BuiltInCommands
            ) &&
            !this.DisabledCommands.includes(
              Command.CommandOptions.name.toLowerCase()
            )
          );
        })
      );

      const GlobalCommands: ApplicationCommandData[] =
        this.ToApplicationCommand(
          this.SlashCommands.filter((Command: SlashCommand) => {
            return (
              !Command.CommandOptions.development &&
              !this.DisabledHandlerCommands.includes(
                Command.CommandOptions.name as BuiltInCommands
              ) &&
              !this.DisabledCommands.includes(
                Command.CommandOptions.name.toLowerCase()
              )
            );
          })
        );

      const rest = new REST().setToken(this.BotConfig.TOKEN);

      if (
        GuildCommands &&
        GuildCommands.length &&
        this.TestServers.length > 0
      ) {
        await Promise.all(
          this.TestServers.map(async (ServerID) => {
            const TestServer = await this.guilds.fetch(ServerID);
            if (TestServer && TestServer instanceof Guild) {
              const GuildID: Snowflake = TestServer.id;
              await rest
                .put(Routes.applicationGuildCommands(this.user.id, GuildID), {
                  body: GuildCommands,
                })
                .then(() => {
                  if (!HandlerCommands)
                    this.LogActionsMessage += magentaBright(
                      `\n• Registering Guild Only Commands in: ${TestServer.name}`
                    );
                });
            }
          })
        );
      }

      if (GlobalCommands && GlobalCommands.length) {
        await rest.put(Routes.applicationCommands(this.user.id), {
          body: GlobalCommands,
        });
        if (!HandlerCommands)
          this.LogActionsMessage += magentaBright(
            `\n• Registered ${GlobalCommands.length} Global Command${
              GlobalCommands.length > 1 ? "s." : "."
            }`
          );
      }
    } catch (CommandSetError) {
      console.log(redBright(`• Error Setting Commands\n${CommandSetError}`));
    }
  }

  private async LoadEvents(
    EventsFolder: string,
    SkippedEvents: string[] | "All" = this.IgnoredEvents
  ): Promise<void> {
    const EventFiles = Engine.ReadFiles(EventsFolder, [".ts", ".js"]);

    const IgnoredNamesLower =
      Array.isArray(SkippedEvents) &&
      SkippedEvents.map((EventName) => EventName.toLowerCase());

    const EventNames: Set<string> = new Set();

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

        const LowerFunctionName = EventFunction.name.toLowerCase();

        if (EventNames.has(LowerFunctionName))
          console.warn(
            yellowBright(
              `• Warning: Event Function name "${EventFunction.name}" exists more than once. This could lead to unexpected behavior, Please ensure each function has a unique name to avoid conflicts.`
            )
          );

        EventNames.add(LowerFunctionName);

        if (SkippedEvents === "All") {
          this.LogActionsMessage += blueBright("\n• Will not register events.");
          return;
        }

        if (
          Array.isArray(IgnoredNamesLower) &&
          IgnoredNamesLower.includes(LowerFunctionName)
        ) {
          if (
            !Object.values(BuiltInEvents)
              .map((Event) => Event.toLowerCase())
              .some((Event) => IgnoredNamesLower.includes(Event))
          ) {
            this.LogActionsMessage += blueBright(
              `\n• Ignoring event: ${EventFunction.name}`
            );
          }

          continue;
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

        if (this.EventsFolder) {
          try {
            await this.LoadEvents(this.EventsFolder);
          } catch (EventsError) {
            console.log(redBright(`• Erroring Loading Events\n${EventsError}`));
            reject(EventsError);
          }
        }

        try {
          await this.LoadEvents(
            path.join(__dirname, "./Handler Events"),
            this.DisabledHandlerEvents
          );
        } catch (HandlerEventsError) {
          console.log(
            redBright(`• Handler Events Error\n${HandlerEventsError}`)
          );
          reject(HandlerEventsError);
        }

        try {
          await this.LoadCommands(
            path.join(__dirname, "./Handler Commands"),
            true
          );
        } catch (HandlerCommandsError) {
          console.log(
            redBright(`• Handler Commands Error\n${HandlerCommandsError}`)
          );
          reject(HandlerCommandsError);
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
            reject(CommandsError);
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
