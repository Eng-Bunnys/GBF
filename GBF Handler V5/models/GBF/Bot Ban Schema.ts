import { Schema, model } from "mongoose";

interface IBotBan {
  userId: string;
  reason: string;
  timeOfBan: Date;
  Developer: string;
}

const GBFBotBanSchema = new Schema<IBotBan>(
  {
    userId: String,
    reason: String,
    timeOfBan: Date,
    Developer: String,
  },
  {
    collection: "Bot Ban Docs",
  }
);

const BotBanModel = model<IBotBan>("Bot Ban Docs", GBFBotBanSchema);

export { IBotBan, BotBanModel };