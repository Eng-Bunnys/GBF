import { Snowflake } from "discord.js";
import { Schema, model } from "mongoose";

interface IServerLogData {
  GuildId: Snowflake;
  DefaultChannel: Snowflake;
  IsEnabled: boolean;
}

const ServerLogSchema = new Schema<IServerLogData>(
  {
    GuildId: String,
    DefaultChannel: {
      type: String,
      default: null,
    },
    IsEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "GBF Log Docs",
  }
);

const GBFServerLogDataModel = model<IServerLogData>(
  "GBF Log Docs",
  ServerLogSchema
);

export { IServerLogData, GBFServerLogDataModel };
