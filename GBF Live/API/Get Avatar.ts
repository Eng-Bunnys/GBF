import {
  User,
  GuildMember,
  ImageURLOptions,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ColorResolvable,
  ButtonStyle,
} from "discord.js";
import { capitalize } from "../utils/Engine";
import colors from "../GBF/GBFColor.json";

const ImageData: ImageURLOptions = { extension: "png", size: 1024 };

class AvatarBuilder {
  private readonly targetUser: User;
  private readonly targetMember: GuildMember | undefined;
  private readonly color: ColorResolvable;
  private readonly priority: boolean;

  constructor(
    targetUser: User,
    targetMember?: GuildMember,
    color: ColorResolvable = colors.DEFAULT as ColorResolvable,
    priority?: boolean
  ) {
    this.targetUser = targetUser;
    this.targetMember = targetMember;
    this.color = color;
    this.priority = priority !== undefined ? priority : false;
  }

  private getAvatarURLs(): string {
    let avatarURLs = `[Global Avatar](${this.targetUser.displayAvatarURL(
      ImageData
    )})`;

    if (
      this.targetMember &&
      this.targetMember.displayAvatarURL() !==
        this.targetUser.displayAvatarURL()
    ) {
      avatarURLs += ` | [Server Avatar](${this.targetMember.displayAvatarURL(
        ImageData
      )})`;
    }

    return avatarURLs;
  }

  public getEmbed(): EmbedBuilder {
    const AvatarEmbed = new EmbedBuilder()
      .setTitle(`${capitalize(this.targetUser.username)}'s Avatar`)
      .setColor(this.color)
      .setDescription(this.getAvatarURLs());

    if (
      this.priority &&
      this.targetMember &&
      this.targetMember.displayAvatarURL() !==
        this.targetUser.displayAvatarURL()
    ) {
      AvatarEmbed.setImage(
        this.targetMember.displayAvatarURL(ImageData)
      ).setThumbnail(this.targetUser.displayAvatarURL(ImageData));
    } else {
      AvatarEmbed.setImage(this.targetUser.displayAvatarURL(ImageData));
    }

    if (
      !this.priority &&
      this.targetMember &&
      this.targetMember.displayAvatarURL() !==
        this.targetUser.displayAvatarURL()
    )
      AvatarEmbed.setThumbnail(this.targetMember.displayAvatarURL(ImageData));

    return AvatarEmbed;
  }

  public getButtonRow(): ActionRowBuilder {
    const AvatarButtons = new ButtonBuilder()
      .setLabel("Global Avatar")
      .setStyle(ButtonStyle.Link)
      .setURL(this.targetUser.displayAvatarURL(ImageData));

    const AvatarButtonsRow: ActionRowBuilder<any> =
      new ActionRowBuilder().addComponents(AvatarButtons);

    if (
      this.targetMember &&
      this.targetMember.displayAvatarURL() !==
        this.targetUser.displayAvatarURL()
    ) {
      const ServerAvatarButton = new ButtonBuilder()
        .setLabel("Server Avatar URL")
        .setStyle(ButtonStyle.Link)
        .setURL(this.targetMember.displayAvatarURL(ImageData));

      AvatarButtonsRow.addComponents(ServerAvatarButton);
    }

    return AvatarButtonsRow;
  }
}

export default AvatarBuilder;
