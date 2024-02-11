import {
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
  PermissionFlagsBits,
} from "discord.js";
import { GBF, GBFClearMessages, SlashCommand } from "gbfcommands";

export class ClearCommand extends SlashCommand {
  constructor(client: GBF) {
    super(client, {
      name: "clear",
      description: "Bulk delete messages in this channel.",
      UserPermissions: [PermissionFlagsBits.ManageMessages],
      BotPermissions: [PermissionFlagsBits.ManageMessages],
      category: "Moderation",
      cooldown: 5,
      options: [
        {
          name: "amount",
          description: "The number of messages to delete",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          minValue: 1,
          maxValue: 100,
        },
        {
          name: "user",
          description: "Only delete this user's messages",
          type: ApplicationCommandOptionType.User,
        },
      ],
      async execute({ client, interaction }) {
        const Amount = (
          interaction.options as CommandInteractionOptionResolver
        ).getInteger("amount", true);
        const TargetUser = interaction.options.getUser("user", false);

        const MessageDeleter = new GBFClearMessages(
          interaction,
          Amount,
          interaction.channel,
          TargetUser ? TargetUser : undefined
        );

        await MessageDeleter.RunClear();
      },
    });
  }
}
