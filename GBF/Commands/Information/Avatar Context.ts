import {
  ActionRowBuilder,
  ApplicationCommandType,
  GuildMember,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { ContextCommand, GBF, GBFAvatarBuilder } from "gbfcommands";

export class ContextCommandTemplate extends ContextCommand {
  constructor(client: GBF) {
    super(client, {
      name: "show avatar",
      ContextType: ApplicationCommandType.User,
      category: "Information",
      cooldown: 2,
      async execute({ client, interaction }) {
        const TargetUser = (interaction as UserContextMenuCommandInteraction)
          .targetUser;
        const TargetMember = (interaction as UserContextMenuCommandInteraction)
          .targetMember as GuildMember | null;

        const AvatarGenerator = new GBFAvatarBuilder(
          TargetUser,
          TargetMember ? TargetMember : undefined
        );

        return interaction.reply({
          embeds: [AvatarGenerator.GetEmbed()],
          components: [
            AvatarGenerator.GetAvatarButtons() as ActionRowBuilder<any>,
          ],
        });
      },
    });
  }
}