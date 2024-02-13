import { Schema, model } from "mongoose";
interface IUserProfile {
  userID: string;
  Wallet: number;
  Bank: number;
  TotalEarned: number;
  DunkelCoins: number;
  RP: number;
  Rank: number;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userID: String,
    Wallet: {
      type: Number,
      default: 0,
    },
    Bank: {
      type: Number,
      default: 1500,
    },
    DunkelCoins: {
      type: Number,
      default: 500,
    },
    TotalEarned: {
      type: Number,
      default: 1500,
    },
    RP: {
      type: Number,
      default: 0,
    },
    Rank: {
      type: Number,
      default: 1,
    },
  },
  {
    collection: "User Profile Data",
  }
);

const UserProfileModel = model<IUserProfile>(
  "User Profile Data",
  UserProfileSchema
);

export { UserProfileModel, IUserProfile };