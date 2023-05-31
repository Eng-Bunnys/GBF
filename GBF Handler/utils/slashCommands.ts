import { GBFSlash, GBFSlashOptions } from "../handler/handlerforSlash";
import GBFClient from "../handler/clienthandler";

class SlashCommand extends GBFSlash {
  constructor(client: GBFClient, options: GBFSlashOptions) {
    super(client, options);
  }
}

export default SlashCommand;
