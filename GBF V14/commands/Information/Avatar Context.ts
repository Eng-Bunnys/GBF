import GBFClient from "../../handler/clienthandler";

import {
  ActionRowBuilder,
  ApplicationCommandType,
  BaseImageURLOptions,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  UserContextMenuCommandInteraction,
  hyperlink
} from "discord.js";

import { capitalize } from "../../utils/Engine";
import colors from "../../GBF/GBFColor.json";
import SlashCommand from "../../utils/slashCommands";

interface IExecute {
  client: GBFClient;
  interaction: UserContextMenuCommandInteraction;
}

export default class ContextAvatar extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "Show Avatar",
      type: ApplicationCommandType.User
    });
  }

  async execute({ client, interaction }: IExecute) {
    const TargetUser = interaction.targetUser || interaction.user;

    let TargetMember: GuildMember | undefined;

    if (interaction.inGuild())
      TargetMember = interaction.guild.members.cache.get(TargetUser.id);
    else TargetMember = undefined;

    const ImageSettings: BaseImageURLOptions = {
      extension: "png",
      size: 1024
    };

    let AvatarURLs: string = `${hyperlink(
      "Global Avatar",
      TargetUser.displayAvatarURL(ImageSettings)
    )}`;

    const AvatarEmbed = new EmbedBuilder()
      .setTitle(`${capitalize(TargetUser.username)}'s Avatar`)
      .setColor(colors.DEFAULT as ColorResolvable)
      .setImage(TargetUser.displayAvatarURL(ImageSettings));

    const AvatarButtons: ActionRowBuilder<any> =
      new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setLabel("Global Avatar")
          .setStyle(ButtonStyle.Link)
          .setURL(TargetUser.displayAvatarURL(ImageSettings))
      ]);

    if (
      TargetMember &&
      TargetMember.displayAvatarURL() !== TargetUser.displayAvatarURL()
    ) {
      AvatarEmbed.setThumbnail(TargetMember.displayAvatarURL(ImageSettings));

      AvatarURLs += ` | ${hyperlink(
        "Server Avatar",
        TargetMember.displayAvatarURL(ImageSettings)
      )}`;

      AvatarButtons.addComponents([
        new ButtonBuilder()
          .setLabel("Server Avatar URL")
          .setStyle(ButtonStyle.Link)
          .setURL(TargetMember.displayAvatarURL(ImageSettings))
      ]);
    }

    AvatarEmbed.setDescription(AvatarURLs);

    return interaction.reply({
      embeds: [AvatarEmbed],
      components: [AvatarButtons]
    });
  }
}
