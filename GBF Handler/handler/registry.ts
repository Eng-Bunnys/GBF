import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import Command from "../utils/command";
import GBFClient from "./clienthandler";
import SlashCommand from "../utils/slashCommands";

export async function registerCommands(client: GBFClient, ...dirs: string[]) {
  for (const dir of dirs) {
    let files = readdirSync(join(__dirname, dir));

    for (let file of files) {
      let stat = lstatSync(join(__dirname, dir, file));

      if (file.includes("-ignore")) continue;

      if (stat.isDirectory()) await registerCommands(client, join(dir, file));
      else {
        if (file.endsWith(".js") || file.endsWith(".ts")) {
          try {
            let cmdModule = new (require(join(__dirname, dir, file)).default)(
              client
            );

            if (cmdModule instanceof Command) {
              const { name, aliases } = cmdModule;

              if (!name)
                throw new Error(
                  `${join(__dirname, dir, file)} does not have a name`
                );

              if (client.commands.has(name))
                throw new Error(`The Message Command "${name}" exists twice.`);

              if (client.DisabledCommands.includes(name)) continue;

              client.commands.set(name, cmdModule);

              if (aliases)
                aliases.map((alias) => client.aliases!.set(alias, name));
            } else if (cmdModule instanceof SlashCommand) {
              const { name } = cmdModule;

              if (client.DisabledCommands.includes(name)) continue;

              if (client.slashCommands.has(name))
                throw new Error(`The Slash Command "${name}" exists twice.`);

              client.slashCommands.set(name, cmdModule);
            }
          } catch (e) {
            console.log(`Error for loading the commands: ${e.message}`);
          }
        }
      }
    }
  }
}
