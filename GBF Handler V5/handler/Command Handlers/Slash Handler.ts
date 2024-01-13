import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommand,
  ApplicationCommandSubGroup,
  CommandInteraction,
} from "discord.js";
import { GBF } from "../GBF";
import { SlashOptions } from "../types";

/**
 * @classdesc Abstract class representing a slash command.
 */
abstract class SlashCommand {
  /**
   * Creates a new instance of SlashCommand.
   *
   * @param {GBF} client - Your client instance.
   * @param {SlashOptions} options - Handler options for the slash command.
   */
  constructor(
    protected readonly client: GBF,
    public readonly options: SlashOptions
  ) {
    if (!this.options?.options.length) {
      if (this.options?.groups != null)
        this.options.options = this.GetSubCommandGroupOptions(
          this.options.groups
        );
      else if (this.options.subcommands != null)
        this.options.options = this.GetSubCommandOptions(
          this.options.subcommands
        );
    }
  }

  /**
   * Execute the slash command.
   *
   * @param {Object} params - Parameters for executing the slash command.
   * @param {GBF} params.client - The client object.
   * @param {CommandInteraction} params.interaction - The interaction object.
   * @returns {Promise<void>} - A promise resolving when the command is executed.
   * @abstract
   */
  abstract execute({
    client,
    interaction,
  }: {
    client: GBF;
    interaction: CommandInteraction;
  }): Promise<void>;

  /**
   * Generates options for subcommands.
   *
   * @private
   * @param {ApplicationCommandSubCommand} SubCommands - Subcommands for which options are generated.
   * @returns {Object[]} - An array of options for subcommands.
   */
  private GetSubCommandOptions(SubCommands: ApplicationCommandSubCommand) {
    const CommandNames = Object.keys(SubCommands);
    const CommandOptions = [];
    for (const name of CommandNames) {
      const CommandOption = {
        name,
        description: SubCommands[name].description,
        options: SubCommands[name].args,
        userPermission: SubCommands[name].userPermission,
        botPermission: SubCommands[name].botPermission,
        type: ApplicationCommandOptionType.Subcommand,
        nsfw: SubCommands[name].NSFW,
        dmPermission: SubCommands[name].dmEnabled,
      };

      CommandOptions.push(CommandOption);
    }
    return CommandOptions;
  }

  /**
   * Generates options for subcommand groups.
   *
   * @private
   * @param {ApplicationCommandSubGroup} Groups - Subcommand groups for which options are generated.
   * @returns {Object[]} - An array of options for subcommand groups.
   */
  private GetSubCommandGroupOptions(Groups: ApplicationCommandSubGroup) {
    const GroupNames = Object.keys(Groups);
    const GroupOptions = [];
    for (const name of GroupNames) {
      const GroupOption = {
        name,
        description: Groups[name].description,
        options: this.GetSubCommandGroupOptions(Groups[name].subcommands),
        userPermission: Groups[name].userPermission,
        botPermission: Groups[name].botPermission,
        type: ApplicationCommandOptionType.SubcommandGroup,
        nsfw: Groups[name].NSFW,
        dmPermission: Groups[name].dmEnabled,
      };
      GroupOptions.push(GroupOption);
    }
    return GroupOptions;
  }
}

export { SlashCommand };
