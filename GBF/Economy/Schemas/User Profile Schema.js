const { Schema, model } = require("mongoose");

const UserProfileSchema = new Schema(
  {
    userId: String,
    userName: String,
    userNameInsensitive: String,
    accountPassword: String,
    introComplete: {
      type: Boolean,
      default: false
    },
    wallet: {
      type: Number,
      default: 500
    },
    bank: {
      type: Number,
      default: 0
    },
    netWorth: {
      type: Number,
      default: 500
    },
    DunkelCoins: {
      type: Number,
      default: 250
    },
    totalEarned: {
      type: Number,
      default: 500
    },
    rank: {
      type: Number,
      default: 1
    },
    RP: {
      type: Number,
      default: 0
    },
    totalRPEarned: {
      type: Number,
      default: 0
    },
    accountAge: {
      type: Date,
      default: Date.now()
    },
    dailyCooldown: {
      type: Date,
      default: new Date(Date.now() - 21600000)
    },
    dailyStreak: {
      type: Number,
      default: 0
    },
    lastTransfer: {
      type: Date,
      default: new Date(Date.now() - 3 * 7 * 24 * 60 * 60 * 1000)
    },
    lastUsernameChange: {
      type: Date,
      default: new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000)
    }
  },
  {
    collection: "DunkelLuz User Profile"
  }
);

module.exports = model("DunkelLuz User Profile", UserProfileSchema);
