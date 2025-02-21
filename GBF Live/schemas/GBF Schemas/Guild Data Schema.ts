import { Schema, model, Document } from "mongoose";

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
      default: "!!"
    },
    DisabledCommands: {
      type: Array,
      default: []
    }
  },
  {
    collection: "GBF Server Data"
  }
);

const GBFGuildDataModel = model<IGuildData>(
  "GBF Server Data",
  GBFGuildDataSchema
);

export { IGuildData, GBFGuildDataModel };
