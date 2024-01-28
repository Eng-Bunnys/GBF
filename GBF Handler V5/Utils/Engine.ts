import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { redBright } from "chalk";
import { Config } from "../Handler/types";

dotenv.config();

export class Engine {
  static ReadFiles(Dir: string, FileExtensions: string[] = []): string[] {
    const Files: string[] = [];

    function ReadDir(CurrentDir: string) {
      const Entries = fs.readdirSync(CurrentDir, {
        withFileTypes: true,
      });

      Entries.forEach((Entry) => {
        const FilePath = path.join(CurrentDir, Entry.name);

        if (Entry.isDirectory()) ReadDir(FilePath);
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

  static LoadConfig(JSONConfigPath?: string): Config {
    const JSONPath =
      JSONConfigPath || path.join(__dirname, "config/config.json");

    try {
      const JSONConfig = require(JSONPath);
      return {
        ...JSONConfig,
        MongoURI: JSONConfig.MongoURI,
        TOKEN: JSONConfig.TOKEN,
      };
    } catch (JSONError) {
      if (JSONConfigPath) {
        console.log(
          redBright(`• Unable to load config from "${JSONConfigPath}"`)
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
