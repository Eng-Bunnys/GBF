import GBFClient from "../handler/clienthandler";
import { GBFCtx, GBFCtxOptions } from "../handler/contextHandler";

export class ContextCommand extends GBFCtx {
  constructor(client: GBFClient, options: GBFCtxOptions) {
    super(client, options);
  }
}
