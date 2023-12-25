import {
  ChannelType,
  Collection,
  EmbedBuilder,
  GuildMember,
  Message,
  PermissionResolvable,
  TextChannel,
  User,
} from "discord.js";
import { IBotBan } from "../models/GBF/Bot Ban Schema";
import { Document } from "mongoose";
import { IGuildData } from "../models/GBF/Bot Settings Schema";
import { MessageCommand } from "../handler/Command Handlers/Message Handler";
import { GBF } from "../handler/GBF";
import { client } from "..";
import { missingPermissions } from "./Engine";

export type ErrorTypes = "BotUserBan";

export class Emojis {
  static readonly Verify = "<:verified:821419611438317638>";
  static readonly VerifyAnimated = "<a:success:838260857280528444>";
  static readonly Error = "<:error:822091680605011978>";
  static readonly ErrorAnimated = "<a:erroranimated:838260327165722625>";
  static readonly Munch = "<a:Cookie:756504279770071113>";
  static readonly Tracer = "<:TracerHappy:832952055840374804>";
  static readonly Breakdance = "<a:BreakDance:755583564011012096>";
  static readonly Epic = "<:Epic:818165468652109834>";
  static readonly Prime = "<:prime:928774301686042694>";
  static readonly UbisoftLogo = "<:ubisoft:885153369260453918>";
  static readonly Partner = "<:D_Partner:826951266357608558>";
  static readonly RemPeace = "<:RemPeace:838991132985655296>";
  static readonly LogoTransparent = "<:LogoTransparent:838994085527945266>";
  static readonly FlyingHearts = "<a:flyinghearts:833542646579462164>";
  static readonly Thx = "<:thx:806276190003789824>";
  static readonly SteamLogo = "<:steam:705062577817780315>";
  static readonly OriginLogo = "<:origin:882978371175346216>";
  static readonly GOGLogo = "<:GOG:882978135338000434>";
  static readonly Beta = "<:beta:959969473568313344>";
  static readonly Arrow = "<a:arrow:819986651208089640>";
  static readonly DStaff = "<:D_Staff:826951574088581140>";
  static readonly _100Badge = "<a:100Badge:963696947015864340>";
  static readonly MaxRankBadge = "<a:maxRankBadge:963988716530049064>";
  static readonly Enable = "<:enable:972569774095741058>";
  static readonly Disable = "<:disable:972570036432699472>";
  static readonly Loading = "<a:Loading:971730094169141248>";
  static readonly PepeHappy = "<:HappyPepe:787387506022154250>";
  static readonly ParrotDance = "<a:rainbowParrot:962455079296839690>";
  static readonly FrogStare = "<:frogSmile:972806676963033139>";
  static readonly MemeDance = "<a:dance1:818168039958773822>";
  static readonly LeftEmpty = "<:leftEmpty:1068143435095220265>";
  static readonly LeftFull = "<:leftFull:1068143511179894804>";
  static readonly MiddleEmpty = "<:middleEmpty:1068143614804377681>";
  static readonly MiddleFull = "<:middleFull:1068143723080319038>";
  static readonly RightEmpty = "<:rightEmpty:1068143887010517032>";
  static readonly RightFull = "<:rightFull:1068143806622470244>";
  static readonly DunkelCoin = "<:dunkelCoin:1023348951337938984>";
  static readonly Trophy = "<:Trophy:1103288598943506452>";
  static readonly Crying = "<:CryingEmoji:1110667371171029172>";
  static readonly Troll = "<:trollface:838959517965353060>";
}

export class ColorCodes {
  static readonly Default = "#e91e63";
  static readonly ErrorRed = "#FF0000";
  static readonly SuccessGreen = "#33a532";
  static readonly SalmonPink = "#ff91a4";
  static readonly CardinalRed = "#C41E3A";
  static readonly Cherry = "#D2042D";
  static readonly PastelRed = "#FAA0A0";
  static readonly Cyan = "#00FFFF";
  static readonly DunkelLuzGreen = "#59C65B";
  static readonly EGS = "#323232";
  static readonly Steam = "#1A688A";
  static readonly GOG = "#A923FC";
  static readonly Prime = "#0069A7";
  static readonly Origin = "#F1720D";
  static readonly Ubisoft = "#B4BCDE";
}

export class GBFEmbeds {
  public GenerateErrorEmbed(ErrorType: ErrorTypes): EmbedBuilder {
    const ErrorEmbed = new EmbedBuilder()
      .setColor(ColorCodes.ErrorRed)
      .setTimestamp();

    if (ErrorType === "BotUserBan")
      ErrorEmbed.setTitle(`${Emojis.Error} Account Ban Notice`).setDescription(
        `Your account has been banned from ${client.user.username} due to a violation of our terms of service`
      );

    return ErrorEmbed;
  }
}
/** Represents a collection to store command cooldowns. */
const CommandCooldowns = new Collection();

/**
 * Class that handles various checks before executing a command.
 */
export class HandlerChecks {
  /** The Discord client instance. */
  private client: GBF;

  /** The user invoking the command. */
  private CommandUser: User;

  /** The guild member invoking the command. */
  private CommandMember: GuildMember;

  /** Data related to user blacklist. */
  private UserBlacklistData: (IBotBan & Document<any, any, IBotBan>) | null;

  /** Guild settings data. */
  private GuildSettings: (IGuildData & Document<any, any, IGuildData>) | null;

  /** The command being executed. */
  private Command: MessageCommand | null;

  /** The message object representing the action type. */
  private ActionType: Message;

  /**
   * Constructs an instance of HandlerChecks.
   * @param {GBF} client - The Discord client instance.
   * @param {User} commandUser - The user invoking the command.
   * @param {GuildMember} commandMember - The guild member invoking the command.
   * @param {(IBotBan & Document<any, any, IBotBan>) | null} userBlacklistData - Data related to user blacklist.
   * @param {(IGuildData & Document<any, any, IGuildData>) | null} guildSettings - Guild settings data.
   * @param {MessageCommand | null} command - The command being executed.
   * @param {Message} actionType - The message object representing the action type.
   */
  constructor(
    client: GBF,
    commandUser: User,
    commandMember: GuildMember,
    userBlacklistData: (IBotBan & Document<any, any, IBotBan>) | null,
    guildSettings: (IGuildData & Document<any, any, IGuildData>) | null,
    command: MessageCommand | null,
    actionType: Message
  ) {
    this.client = client;
    this.CommandUser = commandUser;
    this.CommandMember = commandMember;
    this.UserBlacklistData = userBlacklistData;
    this.GuildSettings = guildSettings;
    this.Command = command;
    this.ActionType = actionType;
  }

  /**
   * Runs various checks before executing a command.
   * @returns {[EmbedBuilder, boolean]} - An array containing an EmbedBuilder and a boolean.
   */
  public async RunChecks(): Promise<[EmbedBuilder, boolean]> {
    const ErrorEmbed = new EmbedBuilder()
      .setColor(ColorCodes.ErrorRed)
      .setTimestamp();

    if (
      this.GuildSettings &&
      this.GuildSettings.DisabledCommands.includes(this.Command.options.name)
    ) {
      ErrorEmbed.setTitle(
        `${Emojis.Error} You can't use that here`
      ).setDescription(
        `${this.Command.options.name} is disabled in ${this.ActionType.guild.name}.`
      );
      return [ErrorEmbed, false];
    }

    if (this.UserBlacklistData && this.UserBlacklistData) {
      ErrorEmbed.setTitle(`${Emojis.Error} Account Ban Notice`).setDescription(
        `Your account has been banned from ${this.client.user.username} due to a violation of ${this.client.user.username}'s terms of service`
      );
      return [ErrorEmbed, false];
    }

    if (
      this.Command.options.development &&
      !this.client.TestServers.includes(this.ActionType.guildId)
    ) {
      ErrorEmbed.setTitle(`${Emojis.Error} You can't use that`).setDescription(
        `${this.Command.options.name} is disabled globally.`
      );
      return [ErrorEmbed, false];
    }

    if (
      this.Command.options.dmEnabled &&
      this.ActionType.channel.type === ChannelType.DM
    ) {
      ErrorEmbed.setTitle(
        `${Emojis.Error} You can't use that here`
      ).setDescription(`${this.Command.options.name} is disabled in DMs.`);
      return [ErrorEmbed, false];
    }

    if (
      this.Command.options.devOnly &&
      !this.client.Developers.includes(this.CommandUser.id)
    ) {
      ErrorEmbed.setTitle(`${Emojis.Error} You can't use that`).setDescription(
        `${this.Command.options.name} is a developer only command.`
      );
      return [ErrorEmbed, false];
    }

    if (
      this.Command.options.partner &&
      !this.client.Partners.includes(this.CommandUser.id)
    ) {
      ErrorEmbed.setTitle(`${Emojis.Error} You can't use that`).setDescription(
        `${this.Command.options.name} is a partner only command.`
      );
      return [ErrorEmbed, false];
    }

    if (
      this.Command.options.NSFW &&
      this.ActionType.channel.type !== ChannelType.DM &&
      !(this.ActionType.channel as TextChannel).nsfw
    ) {
      ErrorEmbed.setTitle(`${Emojis.Error} You can't use that`).setDescription(
        `You cannot use NSFW commands in non-NSFW channels.`
      );
      return [ErrorEmbed, false];
    }

    if (this.ActionType.channel.type !== ChannelType.DM) {
      if (
        this.Command.options.userPermission &&
        !this.CommandMember.permissions.has(
          this.Command.options.userPermission as PermissionResolvable,
          true
        )
      ) {
        ErrorEmbed.setTitle(
          `${Emojis.Error} You can't use that`
        ).setDescription(
          `${
            this.CommandUser.username
          }, You are missing the following permissions: ${missingPermissions(
            this.CommandMember,
            this.Command.options.userPermission
          )}`
        );

        return [ErrorEmbed, false];
      }

      if (
        this.Command.options.botPermission &&
        !this.ActionType.channel
          .permissionsFor(this.ActionType.guild.members.me)
          .has(this.Command.options.botPermission as PermissionResolvable, true)
      ) {
        ErrorEmbed.setTitle(`${Emojis.Error} You can't do that`).setDescription(
          `${
            this.CommandUser.username
          }, I am missing the following permissions: ${missingPermissions(
            this.ActionType.guild.members.me,
            this.Command.options.botPermission
          )}`
        );

        return [ErrorEmbed, false];
      }
    }

    if (
      !this.Command.options.devBypass ||
      (this.Command.options.devBypass &&
        !this.client.Developers.includes(this.CommandUser.id))
    ) {
      /**@unit Seconds */
      const ProvidedCooldownTime: number = this.Command.options.cooldown;

      if (ProvidedCooldownTime) {
        if (!CommandCooldowns.has(this.Command.options.name))
          CommandCooldowns.set(
            this.Command.options.name,
            new Map<string, number>()
          );

        const CurrentTime = Date.now();
        const Timestamps: Map<string, number> = CommandCooldowns.get(
          this.Command.options.name
        ) as Map<string, number>;
        /**@unit Miliseconds */
        const CooldownTime = ProvidedCooldownTime * 1000;

        if (Timestamps.has(this.CommandUser.id)) {
          const ExpirationTime =
            Timestamps.get(this.CommandUser.id)! + CooldownTime;

          if (CurrentTime < ExpirationTime) {
            const RemainingTime = Number(
              (ExpirationTime - CurrentTime).toFixed(1)
            );
            const UnixFormat = Math.round(
              Date.now() / 1000 + RemainingTime / 1000
            );

            ErrorEmbed.setTitle(
              `${Emojis.Error} You can't use that yet`
            ).setDescription(
              `${this.CommandUser}, You can use "${this.Command.options.name}" <t:${UnixFormat}:R>`
            );
          }
        }
        Timestamps.set(this.CommandUser.id, CurrentTime);
        setTimeout(
          () => Timestamps.delete(this.CommandUser.id),
          CooldownTime
        ).unref();
      }
    }
    return [ErrorEmbed, true];
  }
}