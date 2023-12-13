import * as fs from "fs";
import * as path from "path";

import dotenv from "dotenv";
dotenv.config();

export class GBFUtils {
  static isDirectory(path: string): boolean {
    try {
      return fs.statSync(path).isDirectory();
    } catch (error) {
      return false;
    }
  }

  static readFilesRecursively(
    dir: string,
    fileExtensions?: string[]
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

  static loadConfig(customConfigPath?: string): any {
    const ConfigPath =
      customConfigPath || path.join(__dirname, "config/config.json");

    try {
      const jsonConfig = require(ConfigPath);
      return {
        ...jsonConfig,
        MongoURI: jsonConfig.MONGO_URI,
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
        MongoURI: process.env.MONGO_URI,
        TOKEN: process.env.TOKEN, // Set TOKEN based on the environment variable
      };
    }
  }
}
