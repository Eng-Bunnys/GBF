import { CacheType, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import GBFClient from "../handler/clienthandler";
import { CommandOptions, GBFCmd } from "../handler/commandhandler";

interface CtxMenuExecute<T> {
    execute(i: T): unknown

}

export class ContextMessageCommand extends GBFCmd implements CtxMenuExecute<MessageContextMenuCommandInteraction> {
  constructor(client: GBFClient, options: CommandOptions) {
    super(client, options);
  }
  execute(i: MessageContextMenuCommandInteraction<CacheType>): unknown {
        throw new Error("Extend & override this class to execute");
   }

}

export class ContextUserCommand extends GBFCmd implements CtxMenuExecute<UserContextMenuCommandInteraction>{

  constructor(client: GBFClient, options: CommandOptions)  {
    super(client, options);
  }
    execute(i: UserContextMenuCommandInteraction<CacheType>): unknown {
        throw new Error("Extend & override this class to execute");
    }
}
