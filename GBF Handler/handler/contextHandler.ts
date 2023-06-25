import { ApplicationCommandType } from "discord.js";
import GBFClient from "./clienthandler";

export interface GBFCtxOptions {
  /** The command's name [Required] */
  name: string;
  /** Context Menu Type : ApplicationCommandType.User | ApplicationCommandType.Message | ApplicationCommandType.ChatInput [Required]*/
  type:
    | ApplicationCommandType.User
    | ApplicationCommandType.Message
    | ApplicationCommandType.ChatInput;
  /** The command's category */
  category?: string;
  /** Test Server Only command */
  development?: boolean;
  /** Only developers can use this command */
  devOnly?: boolean;
  /** Only partners can use this command */
  partner?: boolean;
  /** Developers bypass the cooldown */
  devBypass?: boolean;
  /** The permissions that the user needs to run the command */
  userPermission?: string | bigint[];
  /** The permissions that the bot needs to execute the command */
  botPermission?: string | bigint[];
  /** The command cooldown in seconds */
  cooldown?: number;
  /** Set it so the command can only be ran in NSFW channels */
  NSFW?: boolean;
}

export class GBFCtx {
  readonly client: GBFClient;
  readonly type:
    | ApplicationCommandType.User
    | ApplicationCommandType.Message
    | ApplicationCommandType.ChatInput;
  readonly name: string;
  readonly devOnly: boolean;
  readonly development: boolean;
  readonly partner: boolean;
  readonly devBypass: boolean;
  readonly userPermission: string | bigint[];
  readonly botPermission: string | bigint[];
  readonly cooldown: number;
  readonly NSFW: boolean;

  constructor(client: GBFClient, options: GBFCtxOptions) {
    this.client = client;
    this.type = options.type;
    this.name = options.name || "";
    this.devOnly = options.devOnly || false;
    this.partner = options.partner || false;
    this.devBypass = options.devBypass || false;
    this.userPermission = options.userPermission || [];
    this.botPermission = options.botPermission || [];
    this.cooldown = options.cooldown || 0;
    this.NSFW = options.NSFW || false;
    this.development = options.development || false;
  }
}
