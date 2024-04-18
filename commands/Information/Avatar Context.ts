import GBFClient from "../../handler/clienthandler";

import {
  ActionRowBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";

import SlashCommand from "../../utils/slashCommands";
import AvatarBuilder from "../../API/Get Avatar";

interface IExecute {
  client: GBFClient;
  interaction: UserContextMenuCommandInteraction;
}

export default class ContextAvatar extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "Show Avatar",
      type: ApplicationCommandType.User,
    });
  }

  async execute({ client, interaction }: IExecute) {
    const targetUser = interaction.targetUser || interaction.user;
    const targetMember = interaction.inGuild()
      ? interaction.guild.members.cache.get(targetUser.id)
      : undefined;

    console.log(targetMember);

    const GetAvatar = new AvatarBuilder(targetUser, targetMember);

    const AvatarEmbed: EmbedBuilder = GetAvatar.getEmbed();

    const AvatarButtons: ActionRowBuilder<any> = GetAvatar.getButtonRow();

    return interaction.reply({
      embeds: [AvatarEmbed],
      components: [AvatarButtons],
    });
  }
}
