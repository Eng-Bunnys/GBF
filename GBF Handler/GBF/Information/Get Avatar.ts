import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  ImageURLOptions,
  User,
} from "discord.js";
import { ColorCodes } from "../../Utils/GBF Features";
import { capitalize } from "../../Handler";

const ImageData: ImageURLOptions = {
  extension: "jpeg",
  size: 1024,
};

// The avatar that will be prioritized
type AvatarPriority = "Global" | "Server";

// Returns the user's avatar!
export class GBFAvatarBuilder {
  // The user who's avatar you want to get
  private readonly TargetUser: User;
  // The same user as a Guild Member
  private readonly TargetMember?: GuildMember;
  // The color of the embed
  private readonly EmbedColor?: ColorResolvable;
  // Which type of avatar to prioritize
  private readonly AvatarPriority?: AvatarPriority;
  // Shows if the user has a unique guild avatar
  private readonly IsAvatarDifferent: boolean;
  /**
   * Constructs a new UserAvatar instance.
   * @param {User} TargetUser - The target user whose avatar is being displayed.
   * @param {GuildMember} [TargetMember] - The guild member corresponding to the target user.
   * @param {ColorResolvable} [EmbedColor = ColorCodes.Default] - The color to be used for the embed.
   * @param {AvatarPriority} [AvatarPriority = 'Global'] - The priority for selecting the avatar.
   */
  constructor(
    TargetUser: User,
    TargetMember: GuildMember = undefined,
    EmbedColor: ColorResolvable = ColorCodes.Default,
    AvatarPriority: AvatarPriority = "Global"
  ) {
    this.TargetUser = TargetUser;
    this.TargetMember = TargetMember;
    this.EmbedColor = EmbedColor;
    this.AvatarPriority = AvatarPriority;

    if (this.TargetMember && this.TargetUser.id !== this.TargetMember.id)
      throw new Error(`The User and Member provided are different users.`);

    this.IsAvatarDifferent = this.TargetMember
      ? this.TargetMember.displayAvatarURL() !=
        this.TargetUser.displayAvatarURL()
      : false;
  }

  /**
   * Generates strings containing links to the user's avatars.
   * @returns {string} The strings containing links to the user's avatars.
   */
  private GetAvatarStrings(): string {
    let URLS = `[Global Avatar](${this.TargetUser.displayAvatarURL(
      ImageData
    )})`;

    if (this.TargetMember && this.IsAvatarDifferent)
      URLS += ` | [Server Avatar](${this.TargetMember.displayAvatarURL(
        ImageData
      )})`;

    return URLS;
  }

  /**
   * Retrieves the URL of the user's avatar based on the selected priority.
   * @returns {string} The URL of the user's avatar.
   */
  public GetAvatar(): string {
    let Avatar = "";

    if (this.AvatarPriority === "Server" && this.IsAvatarDifferent)
      Avatar = `${this.TargetMember.displayAvatarURL(ImageData)}`;
    else Avatar = `${this.TargetUser.displayAvatarURL(ImageData)}`;

    return Avatar;
  }

  /**
   * Generates an embed containing the user's avatar.
   * @returns {EmbedBuilder} The embed containing the user's avatar.
   */
  public GetEmbed(): EmbedBuilder {
    const AvatarEmbed = new EmbedBuilder()
      .setTitle(`${capitalize(this.TargetUser.username)}'s Avatar`)
      .setColor(this.EmbedColor)
      .setDescription(this.GetAvatarStrings());

    if (this.AvatarPriority === "Server" && this.IsAvatarDifferent) {
      AvatarEmbed.setImage(this.GetAvatar()).setThumbnail(
        this.TargetUser.displayAvatarURL(ImageData)
      );
    } else AvatarEmbed.setImage(this.GetAvatar());

    return AvatarEmbed;
  }

  /**
   * Generates buttons for displaying the user's avatars.
   * @returns {ActionRowBuilder} The action row containing buttons for displaying the user's avatars.
   */
  public GetAvatarButtons(): ActionRowBuilder {
    const AvatarButtons = new ButtonBuilder()
      .setLabel("Global Avatar")
      .setStyle(ButtonStyle.Link)
      .setURL(this.TargetUser.displayAvatarURL(ImageData));

    const AvatarButtonsRow: ActionRowBuilder<any> =
      new ActionRowBuilder().addComponents(AvatarButtons);

    if (this.TargetMember && this.IsAvatarDifferent)
      AvatarButtonsRow.addComponents([
        new ButtonBuilder()
          .setLabel("Server Avatar")
          .setStyle(ButtonStyle.Link)
          .setURL(this.TargetMember.displayAvatarURL(ImageData)),
      ]);

    return AvatarButtonsRow;
  }
}