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

class AvatarBuilder {
  private readonly targetUser: User;
  private readonly targetMember: GuildMember | undefined;
  private readonly color: ColorResolvable;

  constructor(
    targetUser: User,
    targetMember?: GuildMember,
    color: ColorResolvable = colors.DEFAULT as ColorResolvable
  ) {
    this.targetUser = targetUser;
    this.targetMember = targetMember;
    this.color = color;
  }

  private getAvatarURLs(): string {
    const imageSettings: ImageURLOptions = {
      extension: "png",
      size: 1024,
    };

    let avatarURLs = `[Global Avatar](${this.targetUser.displayAvatarURL(
      imageSettings
    )})`;

    if (
      this.targetMember &&
      this.targetMember.displayAvatarURL() !==
        this.targetUser.displayAvatarURL()
    ) {
      avatarURLs += ` | [Server Avatar](${this.targetMember.displayAvatarURL(
        imageSettings
      )})`;
    }

    return avatarURLs;
  }

  public getEmbed(): EmbedBuilder {
    const avatarEmbed = new EmbedBuilder()
      .setTitle(`${capitalize(this.targetUser.username)}'s Avatar`)
      .setColor(this.color)
      .setImage(
        this.targetUser.displayAvatarURL({ extension: "png", size: 1024 })
      )
      .setDescription(this.getAvatarURLs());

    if (
      this.targetMember &&
      this.targetMember.displayAvatarURL() !==
        this.targetUser.displayAvatarURL()
    ) {
      avatarEmbed.setThumbnail(
        this.targetMember.displayAvatarURL({ extension: "png", size: 1024 })
      );
    }

    return avatarEmbed;
  }

  public getButtonRow(): ActionRowBuilder {
    const avatarButton = new ButtonBuilder()
      .setLabel("Global Avatar")
      .setStyle(ButtonStyle.Link)
      .setURL(
        this.targetUser.displayAvatarURL({ extension: "png", size: 1024 })
      );

    const buttonRow: ActionRowBuilder<any> =
      new ActionRowBuilder().addComponents(avatarButton);

    if (
      this.targetMember &&
      this.targetMember.displayAvatarURL() !==
        this.targetUser.displayAvatarURL()
    ) {
      const serverAvatarButton = new ButtonBuilder()
        .setLabel("Server Avatar URL")
        .setStyle(ButtonStyle.Link)
        .setURL(
          this.targetMember.displayAvatarURL({ extension: "png", size: 1024 })
        );

      buttonRow.addComponents(serverAvatarButton);
    }

    return buttonRow;
  }
}

export default AvatarBuilder;
