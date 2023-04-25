import { Client } from "discord.js";
import GBFSlash from "../handler/handlerforSlash";

class SlashCommand extends GBFSlash {
  constructor(client: Client, options: any) {
    super(client, options);
  }
}

export default SlashCommand;
