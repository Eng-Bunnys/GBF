import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommand,
  ApplicationCommandSubGroup,
  ApplicationCommandType,
  CommandInteraction,
} from "discord.js";
import { GBF } from "../GBF";
import { SlashOptions } from "../types";

/**
 * @classdesc Abstract class representing a slash command.
 */
abstract class SlashCommand {
  protected readonly client: GBF;
  protected readonly name: string;
  protected readonly description: string;
  protected readonly category?: string;
  protected readonly ContextType?:
    | ApplicationCommandType.ChatInput
    | ApplicationCommandType.Message
    | ApplicationCommandType.User;
  protected readonly NSFW?: boolean;
  protected readonly usage?: string;
  protected readonly examples?: string;
  protected readonly CommandOptions?: ApplicationCommandOptionData[];
  protected readonly UserPermissions?: bigint[];
  protected readonly BotPermissions?: bigint[];
  protected readonly cooldown?: number;
  protected readonly development?: boolean;
  protected readonly DMEnabled?: boolean;
  protected readonly DeveloperOnly?: boolean;
  protected readonly DeveloperBypass?: boolean;
  protected readonly partner?: boolean;
  protected readonly groups?: ApplicationCommandSubGroup;
  protected readonly subcommands?: ApplicationCommandSubCommand;
  /**
   * Creates a new instance of SlashCommand.
   *
   * @param {GBF} client - Your client instance.
   * @param {SlashOptions} options - Handler options for the slash command.
   */
  constructor(client: GBF, public readonly options: SlashOptions) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.category = options.category || "";
    this.ContextType = options.ContextType || ApplicationCommandType.ChatInput;
    this.NSFW = options.NSFW || false;
    this.usage = options.usage || "";
    this.examples = options.examples || "";
    this.CommandOptions = options.options || [];
    this.UserPermissions = options.UserPermissions || [];
    this.BotPermissions = options.BotPermissions || [];
    this.cooldown = options.cooldown || 0;
    this.development = options.development || false;
    this.DMEnabled = options.DMEnabled || false;
    this.DeveloperOnly = options.DeveloperOnly || false;
    this.DeveloperBypass = options.DeveloperBypass || false;
    this.partner = options.partner || false;
    this.groups = options.groups ?? null;
    this.subcommands = options.subcommands ?? null;

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
