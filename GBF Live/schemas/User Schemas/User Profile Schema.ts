import { Schema, model } from "mongoose";

interface IUserProfileData {
  userID: string;
  friends: [string];
  Marriage?: {
    Married: boolean;
    MarriedTo?: string;
    MarriageDate?: Date;
    Ring?: string;
  };
  privateProfile: boolean;
  cash: number;
  bank: number;
  dunkelCoins: number;
  totalEarned: number;
  RP: number;
  Rank: number;
  badges?: {
    levelHundred?: boolean;
  };
  achievements?: {
    welcomeToSueLuz?: boolean;
    PinkStar?: boolean;
  };
  dailyCooldown: Date | null;
  dailyStreak: number;
  extraTimerXP: number | null;
  completedMissions?: {
    intro?: boolean | false;
    MeetRobin?: boolean | false;
    MojaveJob?: boolean | false;
  };
  weapons?: {
    pistol?: boolean;
    uzi?: boolean | false;
  };
  inventory?: {
    rings?: {
      "Oval Diamond Ring"?: boolean;
      "Heart Diamond Ring"?: boolean;
      "Oval Musgravite Ring"?: boolean;
      "Heart Musgravite Ring"?: boolean;
      "Oval Painite Ring"?: boolean;
      "Heart Painite Ring"?: boolean;
      "Heart Pink Star Ring"?: boolean;
    };
  };
}

const FalseBoolean = {
  type: Boolean,
  default: false
};

const UserProfileSchema = new Schema<IUserProfileData>(
  {
    userID: String,
    friends: [String],
    Marriage: {
      Married: Boolean,
      MarriedTo: String,
      MarriageDate: Date,
      Ring: String
    },
    privateProfile: FalseBoolean,
    cash: {
      type: Number,
      default: 0
    },
    bank: {
      type: Number,
      default: 1500
    },
    dunkelCoins: {
      type: Number,
      default: 500
    },
    totalEarned: {
      type: Number,
      default: 1500
    },
    RP: {
      type: Number,
      default: 0
    },
    Rank: {
      type: Number,
      default: 1
    },
    badges: {
      levelHundred: FalseBoolean
    },
    achievements: {
      welcomeToSueLuz: FalseBoolean,
      PinkStar: FalseBoolean
    },
    weapons: {
      pistol: FalseBoolean,
      uzi: FalseBoolean
    },
    dailyCooldown: Date,
    dailyStreak: Number,
    extraTimerXP: Number,
    completedMissions: {
      intro: FalseBoolean,
      MeetRobin: FalseBoolean,
      MojaveJob: FalseBoolean
    },
    inventory: {
      rings: {
        "Oval Diamond Ring": FalseBoolean,
        "Heart Diamond Ring": FalseBoolean,
        "Oval Musgravite Ring": FalseBoolean,
        "Heart Musgravite Ring": FalseBoolean,
        "Oval Painite Ring": FalseBoolean,
        "Heart Painite Ring": FalseBoolean,
        "Heart Pink Star Ring": FalseBoolean
      }
    }
  },
  {
    collection: "User Profile Data"
  }
);

const GBFUserProfileModel = model<IUserProfileData>(
  "User Profile Data",
  UserProfileSchema
);

export { IUserProfileData, GBFUserProfileModel };
