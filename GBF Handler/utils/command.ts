import { CommandOptions, GBFCmd } from "../handler/commandhandler";
import GBFClient from "../handler/clienthandler";

class Command extends GBFCmd {
  constructor(client: GBFClient, options: CommandOptions) {
    super(client, options);
  }
}

export default Command;
