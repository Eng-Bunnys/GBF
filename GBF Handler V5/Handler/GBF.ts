import {
  ApplicationCommandType,
  BitFieldResolvable,
  Client,
  ClientOptions,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import { redBright, greenBright, blueBright } from "chalk";
import { AppConfig, IGBF, IgnoreEvents } from "./types";
import { Engine } from "../Utils/Engine";

export class GBF extends Client implements IGBF {
  private HandlerVersion: string;
  public readonly LogActions?: boolean;
  private LogActionsMessage: string = "";
  public readonly HandlerEvents: Collection<string, Function> =
    new Collection();
  public readonly EventsFolder?: string;
  public readonly IgnoredEvents?: IgnoreEvents;

  public readonly CommandsFolder?: string;

  public readonly BotConfig?: AppConfig;
  public readonly intents:
    | GatewayIntentBits[]
    | BitFieldResolvable<string, number>;
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
    this.HandlerVersion = "5.0.0";
    this.LogActions = HandlerOptions.LogActions;

    this.LogActionsMessage += greenBright(
      `• GBF Handler v${this.HandlerVersion} is now online!\n`
    );
  }

  private async LoadEvents(EventsFolder: string): Promise<void> {
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

        if (this.IgnoredEvents === "All") {
          this.LogActionsMessage += blueBright("• Will not register events.\n");
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
            `• Ignoring event: ${EventFunction.name}\n`
          );
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
          }
        }
        if (this.LogActions) console.log(this.LogActionsMessage);

        resolve("Login Successful!");
      } catch (LoginError) {
        reject(LoginError);
      }
    });
  }
}
