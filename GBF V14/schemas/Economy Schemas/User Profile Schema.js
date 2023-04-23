const { Schema, model } = require("mongoose");

const UserProfileSchema = new Schema(
  {
    userID: String,
    privateProfile: {
      type: Boolean,
      default: false
    },
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
      type: Array,
      default: []
    },
    dailyCooldown: Date,
    //type: Date,
    //default: new Date(Date.now() - 86400000)
    dailyStreak: Number,
    extraTimerXP: Number
  },
  {
    collection: "User Profile Data"
  }
);

module.exports = model("User Profile Data", UserProfileSchema);
