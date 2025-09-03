import { Schema, model, Document } from "mongoose";

interface ICasinoData extends Document {
  userID: string;
  Wins: number;
  Losses: number;
  CashSpent: number;
  CashEarned: number;
  WheelTimer: Date;
}

const NumZero = {
  type: Number,
  default: 0
};

const CasinoSchema = new Schema<ICasinoData>(
  {
    userID: String,
    Wins: NumZero,
    Losses: NumZero,
    CashSpent: NumZero,
    CashEarned: NumZero,
    WheelTimer: Date
  },
  {
    collection: "Casino Data"
  }
);

const GBFCasinoModel = model<ICasinoData>("Casino Data", CasinoSchema);

export { ICasinoData, GBFCasinoModel };
