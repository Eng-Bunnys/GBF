import { Schema, model } from "mongoose";

interface IKick {
  userId: string;
  guildId: string;
  Cases: string[];
  Reasons: string[];
  TotalCases: number;
}

const KickSchema = new Schema<IKick>(
  {
    userId: String,
    guildId: String,
    Cases: {
      type: Array,
      default: []
    },
    Reasons: {
      type: Array,
      default: []
    },
    TotalCases: {
      type: Number,
      default: 0
    }
  },
  {
    collection: "GBF Kick Docs"
  }
);

const GBFUserKickModel = model<IKick>("GBF Kick Docs", KickSchema);

export { IKick, GBFUserKickModel };
