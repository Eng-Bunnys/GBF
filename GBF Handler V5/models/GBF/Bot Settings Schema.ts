import { Model, Schema, model } from "mongoose";

interface IGuildData {
  guildID: string;
  Prefix: string;
  DisabledCommands: string[];
}

const GBFGuildDataSchema = new Schema<IGuildData>(
  {
    guildID: String,
    Prefix: {
      type: String,
      default: "!!",
    },
    DisabledCommands: {
      type: Array,
      default: [],
    },
  },
  {
    collection: "Bot Server Data",
  }
);

const BotGuildModel: Model<IGuildData> = model<IGuildData>(
  "Bot Server Data",
  GBFGuildDataSchema
);

export { IGuildData, BotGuildModel };