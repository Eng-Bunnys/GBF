import { Schema, model, Document } from "mongoose";

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
    Developer: String
  },
  {
    collection: "GBF Bot Ban Docs"
  }
);

const GBFBotBanModel = model<IBotBan>("GBF Bot Ban Docs", GBFBotBanSchema);

export { IBotBan, GBFBotBanModel };
