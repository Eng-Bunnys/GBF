import GBFClient from "../../handler/clienthandler";
import SlashCommand from "../../utils/slashCommands";

import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  hyperlink
} from "discord.js";

import colors from "../../GBF/GBFColor.json";
import { capitalize } from "../../utils/Engine";

export default class UserInfoCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "info",
      description: "User information commands",
      category: "",
      userPermission: [],
      botPermission: [],
      cooldown: 5,
      development: true,
      subcommands: {
        avatar: {
          description: "View a user's avatar",
          args: [
            {
              name: "user",
              description: "The user that you want to view their avatar",
              type: ApplicationCommandOptionType.User
            }
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser =
              interaction.options.getUser("user", false) || interaction.user;

            const TargetMember = interaction.guild.members.cache.get(
              TargetUser.id
            );

            let AvatarURLs: string = `${hyperlink(
              "Avatar URL",
              TargetUser.displayAvatarURL({
                extension: "png"
              })
            )}`;

            const AvatarEmbed = new EmbedBuilder()
              .setTitle(`${capitalize(TargetUser.username)}'s Avatar`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(
                TargetUser.displayAvatarURL({
                  extension: "png",
                  size: 1024
                })
              );

            const AvatarButtons: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setLabel("Avatar URL")
                  .setStyle(ButtonStyle.Link)
                  .setURL(
                    TargetUser.displayAvatarURL({
                      extension: "png"
                    })
                  )
              ]);

            if (
              TargetMember &&
              TargetMember.displayAvatarURL() !== TargetUser.displayAvatarURL()
            ) {
              AvatarEmbed.setThumbnail(
                TargetMember.displayAvatarURL({
                  extension: "png"
                })
              );

              AvatarURLs += ` ${hyperlink(
                "Server Avatar",
                TargetMember.displayAvatarURL({
                  extension: "png"
                })
              )}`;

              AvatarButtons.addComponents([
                new ButtonBuilder()
                  .setLabel("Server Avatar URL")
                  .setStyle(ButtonStyle.Link)
                  .setURL(
                    TargetMember.displayAvatarURL({
                      extension: "png"
                    })
                  )
              ]);
            }

            AvatarEmbed.setDescription(AvatarURLs);

            return interaction.reply({
              embeds: [AvatarEmbed],
              components: [AvatarButtons]
            });
          }
        }
      }
    });
  }
}
