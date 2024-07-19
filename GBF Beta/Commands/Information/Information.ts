import {
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
} from "discord.js";
import {
  SlashCommand,
  GBF,
  AvatarPriority,
  GBFAvatar,
  ColorCodes,
} from "../../Handler";

export class Information extends SlashCommand {
  constructor(client: GBF) {
    super(client, {
      name: "info",
      description: "User & Server Information Command",
      category: "Information",
      cooldown: 5,
      subcommands: {
        avatar: {
          description: "Show a user's avatar",
          SubCommandOptions: [
            {
              name: "user",
              description: "The user to display their avatar",
              type: ApplicationCommandOptionType.User,
            },
            {
              name: "priority",
              description:
                "Show the Server or Global avatar as the main avatar",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Global",
                  value: "Global",
                },
                {
                  name: "Server",
                  value: "Guild",
                },
              ],
            },
          ],
          DMEnabled: true,
          async execute({ client, interaction }) {
            const TargetUser =
              (interaction.options as CommandInteractionOptionResolver).getUser(
                "user",
                false
              ) || interaction.user;
            const AvatarPriority: AvatarPriority | string =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("priority", false) || "Global";

            const GBFAPI = new GBFAvatar(
              TargetUser.id,
              interaction.guild ? interaction.guildId : null,
              ColorCodes.Default,
              AvatarPriority as AvatarPriority
            );

            return await interaction.reply({
              embeds: [GBFAPI.GenerateEmbed()],
              components: [GBFAPI.GetAvatarButtons()],
            });
          },
        },
      },
    });
  }
}
