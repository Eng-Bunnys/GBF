import GBFClient, { IGBFClient } from "../handler/clienthandler";
import { ClientOptions } from "discord.js";

class Client extends GBFClient {
  constructor(options: IGBFClient & ClientOptions) {
    super(options);
  }
}

export default Client;