const { Schema, model } = require("mongoose");

const TimerSchema = new Schema(
  {
    userID: String,
    intiationTime: Date,
    numberOfStarts: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  },
  {
    collection: "Timer data"
  }
);

module.exports = model("Timer data", TimerSchema);
