import { GBF } from "../GBF";
import { readdir } from "fs/promises";
import { join, resolve } from "path";
import { redBright } from "chalk";
import { MessageCommand } from "./Message Handler";
import { SlashCommand } from "./Slash Handler";

async function LoadCommand(client: GBF, FilePath: string) {
  try {
    const CommandModule = await import(FilePath);
    const CommandClass = CommandModule.default
      ? CommandModule.default
      : Object.values(CommandModule)[0];

    if (
      typeof CommandClass !== "function" ||
      (!(CommandClass.prototype instanceof MessageCommand) &&
        !(CommandClass.prototype instanceof SlashCommand))
    )
      throw new Error(
        redBright(
          `"${FilePath}" does not export a constructable class extending MessageCommand or SlashCommand.`
        )
      );

    const CommandInstance: MessageCommand | SlashCommand = new CommandClass(
      client
    );

    if (CommandClass.prototype instanceof MessageCommand) {
      const { name, aliases, description } = (CommandInstance as MessageCommand)
        .CommandOptions;

      if (!name)
        throw new Error(
          redBright(`"${FilePath}" does not have a name option.`)
        );

      if (!description)
        throw new Error(
          redBright(`"${FilePath}" does not have a description option.`)
        );

      if (client.MessageCommands.has(name))
        throw new Error(
          redBright(`The Message Command "${name}" exists twice.`)
        );

      if (aliases) {
        aliases.forEach((Alias) => {
          client.Aliases!.set(Alias, name);
        });
      }

      client.MessageCommands.set(name, CommandInstance as MessageCommand);
    } else {
      const { name } = (CommandInstance as SlashCommand).CommandOptions;

      if (!name) throw new Error(`"${FilePath}" does not have a name option.`);

      if (client.SlashCommands.has(name))
        throw new Error(redBright(`The Slash Command "${name}" exists twice.`));

      client.SlashCommands.set(name, CommandInstance as SlashCommand);
    }
  } catch (LoadError) {
    console.log(redBright(`Command Load Error\n${LoadError}`));
  }
}
export async function RegisterCommands(
  client: GBF,
  ...dirs: string[]
): Promise<void> {
  await Promise.all(
    dirs.map(async (dir) => {
      try {
        const DirPath = resolve(__dirname, dir);
        const AvailableFiles = await readdir(DirPath, { withFileTypes: true });

        for (const File of AvailableFiles) {
          const FilePath = join(DirPath, File.name);

          if (File.name.includes("-ignore") || File.isDirectory()) {
            await RegisterCommands(client, FilePath);
          } else if (File.name.endsWith(".ts") || File.name.endsWith(".js")) {
            await LoadCommand(client, FilePath);
          }
        }
      } catch (RegisterError) {
        console.error(
          redBright(`Error when reading directory ${dir}\n${RegisterError}`)
        );
      }
    })
  );
}
