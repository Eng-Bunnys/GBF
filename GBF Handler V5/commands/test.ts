import { GBF } from "../handler/GBF";
import { MessageCommand } from "../handler/Command Handlers/Message Handler";
import { MessageCommandExecute } from "../handler/types";

export default class PingCommand extends MessageCommand {
  constructor(client: GBF) {
    super(client, {
      name: "ping",
      description: "Ping command to check bot latency.",
      async execute({ client, message, args }) {},
    });
  }

  async execute({
    client,
    message,
    args,
  }: MessageCommandExecute): Promise<any> {
    console.log("Working");
  }
}
