import {
  ChannelType,
  CommandInteraction,
  Events,
  GuildMember,
  Interaction,
} from "discord.js";
import { GBF } from "../GBF";
import { Document } from "mongoose";
import { IBotBan, BotBanModel } from "../../models/GBF/Bot Ban Schema";
import {
  IGuildData,
  BotGuildModel,
} from "../../models/GBF/Bot Settings Schema";
import { HandlerChecks } from "../../utils/GBF Features";

export default async function GBFInteractionCreate(client: GBF) {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.user.bot) return;

    let BanData: (IBotBan & Document<any, any, IBotBan>) | null =
      client.DatabaseInteractions
        ? await BotBanModel.findOne({ userId: interaction.user.id })
        : null;

    let GuildSettings: (IGuildData & Document<any, any, IGuildData>) | null =
      !interaction.inGuild()
        ? null
        : client.DatabaseInteractions
        ? (await BotGuildModel.findOne({ guildID: interaction.guildId })) ||
          (await new BotGuildModel({ guildID: interaction.guildId }).save())
        : null;

    if (interaction.isCommand()) {
      const command = client.SlashCommands.get(interaction.commandName);

      if (!command) return;

      const HandlerCheck = await new HandlerChecks(
        client,
        interaction.user,
        interaction.member as GuildMember,
        BanData,
        GuildSettings,
        command,
        interaction
      ).RunChecks();

      if (!HandlerCheck[1]) {
        interaction.reply({
          embeds: [HandlerCheck[0]],
          ephemeral: true,
        });
        return;
      }

      if (interaction.isChatInputCommand()) {
        const CommandGroup = interaction.options.getSubcommandGroup(false);
        const SubCommand = interaction.options.getSubcommand(false);

        try {
          if (command.options.groups || command.options.subcommands) {
            const CommandSubCommand = command.options.groups
              ? command.options.groups[CommandGroup].subcommands[SubCommand]
              : command.options.subcommands[SubCommand];
          }
        } catch (err) {}
      }
    }
  });
}
