import { CommandInteraction, Events, Interaction } from "discord.js";
import { GBF } from "../Handler/GBF";

export function InteractionCreate(client: GBF) {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const Slash = client.SlashCommands.get(
      (interaction as CommandInteraction).commandName
    );

    try {
      //@ts-ignore
      await Slash.options.execute({ client, interaction });
    } catch (err) {
      console.log(err);
    }
  });
}
