const { Schema, model } = require("mongoose");

const UserProfileSchema = new Schema(
  {
    userID: String,
    cash: {
      type: Number,
      default: 1500
    },
    dunkelCoins: {
      type: Number,
      default: 500
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
