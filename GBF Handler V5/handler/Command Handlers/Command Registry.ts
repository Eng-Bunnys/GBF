import { readdir, lstat } from "fs/promises";
import { join, resolve } from "path";
import { MessageCommand } from "./Message Handler";
import GBF from "../GBF";

async function LoadCommand(client: GBF, filePath: string): Promise<void> {
  try {
    const CommandModule = new (await import(filePath)).default(
      client
    ) as MessageCommand;

    const { name, aliases } = CommandModule.options;

    if (!name) throw new Error(`${filePath} does not have a name option.`);

    if (client.MessageCommands.has(name))
      throw new Error(`The Message Command "${name}" exists twice.`);

    client.MessageCommands.set(name, CommandModule);

    if (aliases) {
      aliases.forEach((alias) => {
        client.aliases!.set(alias, name);
      });
    }
  } catch (err) {
    console.error(
      `Error when loading the command module ${filePath}: ${err.message}`
    );
  }
}

export async function RegisterCommands(
  client: GBF,
  ...dirs: string[]
): Promise<void> {
  for (const dir of dirs) {
    try {
      const DirPath = resolve(__dirname, dir);

      const AvailableFiles = await readdir(DirPath);

      await Promise.all(
        AvailableFiles.map(async (file) => {
          const FilePath = join(DirPath, file);
          const Stat = await lstat(FilePath);

          if (file.includes("-ignore")) return;

          if (Stat.isDirectory()) {
            await RegisterCommands(client, FilePath);
          } else if (file.endsWith(".ts") || file.endsWith(".js")) {
            await LoadCommand(client, FilePath);
          }
        })
      );
    } catch (err) {
      console.error(`Error when reading directory ${dir}: ${err.message}`);
    }
  }
}
