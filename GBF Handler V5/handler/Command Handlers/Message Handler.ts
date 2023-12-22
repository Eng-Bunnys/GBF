import { Message } from "discord.js";
import GBF from "../GBF";
import { CommandOptions } from "../types";

abstract class MessageCommand<T extends string[] | undefined = string[]> {
  constructor(
    protected readonly client: GBF,
    public readonly options: CommandOptions<T>
  ) {}

  /**
   * Execute the command.
   *
   * @param client - Your client
   * @param message - typeof Message
   * @param args - The user input split into an array
   * @returns A Promise resolving to a Discord message or any other result.
   */
  abstract execute(
    client: GBF,
    message: Message,
    args?: T
  ): Promise<Message | any>;
}

export { MessageCommand };
