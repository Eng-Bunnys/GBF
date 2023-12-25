import { readdir } from "fs/promises";
import { join, resolve } from "path";
import { MessageCommand } from "./Message Handler";
import { GBF } from "../GBF";

/**
 * Load a command module and register it with the client.
 *
 * @param {GBF} client - The Discord client instance.
 * @param {string} filePath - The path to the command module.
 * @returns {Promise<void>} - A promise resolving when the command is loaded.
 */
async function LoadCommand(client: GBF, filePath: string): Promise<void> {
  try {
    const CommandModule = await import(filePath);
    const CommandClass = CommandModule.default || CommandModule;

    if (
      typeof CommandClass !== "function" ||
      !(CommandClass.prototype instanceof MessageCommand)
    ) {
      throw new Error(
        `${filePath} does not export a constructable class extending MessageCommand.`
      );
    }

    const CommandInstance = new CommandClass(client);
    const { name, aliases } = CommandInstance.options;

    if (!name) {
      throw new Error(`${filePath} does not have a name option.`);
    }

    if (client.MessageCommands.has(name)) {
      throw new Error(`The Message Command "${name}" exists twice.`);
    }

    client.MessageCommands.set(name, CommandInstance);

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

/**
 * Register all command modules in specified directories.
 *
 * @param {GBF} client - The Discord client instance.
 * @param {...string} dirs - The directories to scan for command modules.
 * @returns {Promise<void>} - A promise resolving when all commands are registered.
 */
export async function RegisterCommands(
  client: GBF,
  ...dirs: string[]
): Promise<void> {
  await Promise.all(
    dirs.map(async (dir) => {
      try {
        const DirPath = resolve(__dirname, dir);
        const AvailableFiles = await readdir(DirPath, { withFileTypes: true });

        for (const file of AvailableFiles) {
          const filePath = join(DirPath, file.name);

          if (file.name.includes("-ignore") || file.isDirectory()) {
            await RegisterCommands(client, filePath);
          } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
            await LoadCommand(client, filePath);
          }
        }
      } catch (err) {
        console.error(`Error when reading directory ${dir}: ${err.message}`);
      }
    })
  );
}
