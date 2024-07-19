import { Snowflake } from "discord.js";
import { Schema, model } from "mongoose";

interface IUserProfile {
  /**
   * The user's ID
   * @type {Snowflake}
   */
  userID: string;
  /**
   * The amount of cash in the user's wallet
   * @type {number}
   */
  Wallet: number;
  /**
   * The amount of cash in the user's bank account
   * @type {number}
   */
  Bank: number;
  /**
   * The total amount of money that the user has ever earned / received
   * @type {number}
   */
  TotalEarned: number;
  /**
   * The total number of Dunkel Coins that the user has [Special Currency]
   * @type {number}
   */
  DunkelCoins: number;
  /**
   * The amount of RP that the user has [Resets every rank change]
   * @type {number}
   */
  RP: number;
  /**
   * The user's current Rank
   * @type {number}
   */
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
