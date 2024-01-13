import * as fs from "fs";
import * as path from "path";

import dotenv from "dotenv";
import { EmbedBuilder } from "discord.js";
import { ColorCodes, Emojis } from "./GBF Features";
dotenv.config();

export type GBFErrors = "BotBanned" | "testTwo";

interface Config {
  MongoURI: string;
  TOKEN: string;
}

export class GBFUtils {
  protected ErrorEmbeds(ErrorType: GBFErrors) {
    const ErrorEmbed = new EmbedBuilder()
      .setColor(ColorCodes.ErrorRed)
      .setTimestamp();

    if (ErrorType === "BotBanned") {
      ErrorEmbed.setTitle(`${Emojis.Error}`);
    }
  }

  static readFilesRecursively(
    dir: string,
    fileExtensions: string[] = []
  ): string[] {
    const files: string[] = [];

    function readDirRecursive(currentDir: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      entries.forEach((entry) => {
        const filePath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          readDirRecursive(filePath);
        } else {
          const extension = path.extname(filePath).toLowerCase();

          if (!fileExtensions || fileExtensions.includes(extension)) {
            files.push(filePath);
          }
        }
      });
    }

    readDirRecursive(dir);

    return files;
  }

  static loadConfig(customConfigPath?: string): Config {
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
