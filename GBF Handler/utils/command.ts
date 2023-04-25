import { Client } from "discord.js";
import GBFCmd from "../handler/commandhandler";

class Command extends GBFCmd {
  constructor(client: Client, options: any) {
    super(client, options);
  }
}

export default Command;
