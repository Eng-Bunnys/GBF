const { Schema, model } = require("mongoose");

const TimerSchema = new Schema(
  {
    userID: String,
    messageID: String,
    seasonName: String,
    seasonLevel: {
      type: Number,
      default: 1
    },
    seasonXP: {
      type: Number,
      default: 0
    },
    accountXP: {
      type: Number,
      default: 0
    },
    accountLevel: {
      type: Number,
      default: 1
    },
    startTime: {
      type: Array,
      default: []
    },
    intiationTime: {
      type: Date,
      default: null
    },
    sessionTopic: String,
    numberOfStarts: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    longestSessionTime: {
      type: Number,
      default: 0
    },
    sessionLengths: {
      type: Array,
      default: []
    },
    lastSessionTime: Number,
    lastSessionDate: Date,
    breakTime: {
      type: Number,
      default: 0
    },
    totalBreaks: {
      type: Number,
      default: 0
    },
    sessionBreaks: {
      type: Number,
      default: 0
    },
    sessionBreakTime: {
      type: Number,
      default: 0
    },
    breakTimerStart: Date
  },
  {
    collection: "Timer data"
  }
);

module.exports = model("Timer data", TimerSchema);
