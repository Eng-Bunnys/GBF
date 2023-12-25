// Import necessary types from Discord.js and your custom types
import { Message } from "discord.js";
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
    protected readonly client: GBF, //Replace with your actual client type.
    public readonly options: CommandOptions<T>
  ) {}

  /**
   * Execute the command.
   *
   * @param {GBF} client - Your client instance.
   * @param {Message} message - The Discord message.
   * @param {T} args - The user input split into an array.
   * @returns {Promise<Message | any>} - A Promise resolving to a Discord message or any other result.
   * @abstract
   */
  abstract execute(
    client: GBF, //Replace with your actual client type.
    message: Message,
    args?: T
  ): Promise<Message | any>;
}

export { MessageCommand };