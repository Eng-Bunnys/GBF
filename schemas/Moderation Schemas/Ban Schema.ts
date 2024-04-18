import { Schema, model } from "mongoose";

interface IBan {
  userId: string;
  guildId: string;
  Cases: string[];
  Reasons: string[];
  TotalCases: number;
}

const BanSchema = new Schema<IBan>(
  {
    userId: String,
    guildId: String,
    Cases: {
      type: [String],
      default: []
    },
    Reasons: {
      type: [String],
      default: []
    },
    TotalCases: {
      type: Number,
      default: 0
    }
  },
  {
    collection: "GBF Ban Docs"
  }
);

const GBFUserBanModel = model<IBan>("GBF Ban Docs", BanSchema);

export { IBan, GBFUserBanModel };
