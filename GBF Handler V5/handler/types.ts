import { GatewayIntentBits, BitFieldResolvable } from "discord.js";

export interface BotConfig {
  apiKey: string;
  botToken: string;
}

export interface IGBFClient {
  /**The installed version fo the GBF Handler */
  HandlerVersion?: string;
  /**The location of your commands folder Eg. ./commands */
  CommandsFolder?: string;
  /**The location of your commands folder Eg. ./events */
  EventsFolder?: string;
  /**Log handler actions like commands registered etc. */
  LogActions?: boolean;
  /**Your bot's default prefix */
  Prefix?: string;
  /**An array of prefixes, use this if you want to have more than one prefix. */
  Prefixes?: string[];
  /**An array that contains all of the bot's developers' IDs */
  Developers?: string[];
  /**The location of your config folder Eg. path.join(__dirname, "./config/GBFconfig.json") */
  config?: any;
  /**Automatically login without having to call the login function */
  AutoLogin?: boolean;
  /**The bot's intents */
  intents: GatewayIntentBits[] | BitFieldResolvable<string, number>;
  /**An array that contains all of the test servers that get the development commands */
  TestServers?: string[];
  /**A channel to log important bot activity like bot user bans */
  LogsChannel?: string;
  /**An array that contains all of your bot's partners' IDs */
  Partners?: string[];
  /**A URL to your bot's support server */
  SupportServer?: string;
  /**Your bot's version | Default: 1.0.0 */
  Version?: string;
  /**A boolean that sets whether the bot's commands can be ran in DMs or not | Default: false */
  DMCommands?: boolean;
}
