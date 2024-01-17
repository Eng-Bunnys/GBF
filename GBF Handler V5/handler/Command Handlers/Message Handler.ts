import { GBF } from "../GBF";
import { CommandOptions } from "../types";

/**
 * Abstract class representing a message command.
 *
 * @template T - The type of arguments expected by the command.
 */
abstract class MessageCommand<T extends string[] | undefined = string[]> {
  /**
   * Creates a new instance of MessageCommand.
   *
   * @param {GBF} client - Your client instance.
   * @param {CommandOptions<T>} options - Options for the command.
   */
  constructor(
    protected readonly client: GBF,
    public readonly options: CommandOptions<T> = {
      name: undefined,
      description: undefined,
      category: "",
      aliases: [],
      NSFW: false,
      usage: `${client.Prefix}${options.name}`,
      examples: `${client.Prefix}${options.name}`,
      cooldown: 0,
      UserPermissions: [],
      BotPermissions: [],
      DeveloperOnly: false,
      DeveloperBypass: false,
      development: false,
      DMEnabled: client.DMCommands,
      partner: false,
      IgnoreCommand: false,
      async execute({ client, message, args }) {},
    }
  ) {}
}

export { MessageCommand };
