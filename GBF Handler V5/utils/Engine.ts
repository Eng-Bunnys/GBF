import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import { SlashCommand } from "../handler/Command Handlers/Slash Handler";
import { ApplicationCommandData, Collection } from "discord.js";
import { client } from "..";
dotenv.config();

export type GBFErrors = "BotBanned" | "testTwo";

interface Config {
  MongoURI: string;
  TOKEN: string;
}

export class Engine {
  static ReadFiles(Dir: string, FileExtensions: string[] = []): string[] {
    const Files: string[] = [];

    function ReadDir(CurrentDir: string) {
      const Entries = fs.readdirSync(CurrentDir, { withFileTypes: true });

      Entries.forEach((entry) => {
        const FilePath = path.join(CurrentDir, entry.name);

        if (entry.isDirectory()) ReadDir(FilePath);
        else {
          const FileExtension = path.extname(FilePath).toLowerCase();

          if (!FileExtensions || FileExtensions.includes(FileExtension))
            Files.push(FilePath);
        }
      });
    }

    ReadDir(Dir);

    return Files;
  }

  static async CheckInteractionCommands(
    Commands: SlashCommand[] | ApplicationCommandData[]
  ) {
    const RegisteredCommands = await client.application.commands.fetch();

    console.log(RegisteredCommands);
  }

  static LoadConfig(customConfigPath?: string): Config {
    const ConfigPath =
      customConfigPath || path.join(__dirname, "config/config.json");

    try {
      const jsonConfig = require(ConfigPath);
      return {
        ...jsonConfig,
        MongoURI: jsonConfig.MongoURI,
        TOKEN: jsonConfig.TOKEN,
      };
    } catch (error) {
      if (customConfigPath) {
        console.error(
          `Error: Unable to load config from specified path: ${customConfigPath}`
        );
        process.exit(1);
      }

      return {
        MongoURI: process.env.MongoURI,
        TOKEN: process.env.TOKEN,
      };
    }
  }
}
