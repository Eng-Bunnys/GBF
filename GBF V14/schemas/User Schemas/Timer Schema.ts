import { Schema, model, Document } from "mongoose";

interface ITimerData extends Document {
  userID: string;
  messageID: string;
  seasonName: string;
  seasonLevel: number;
  seasonXP: number;
  startTime: number[];
  initiationTime: Date | null;
  sessionTopic: string;
  numberOfStarts: number;
  timeSpent: number;
  longestSessionTime: number;
  sessionLengths: number[];
  lastSessionTime: number | null;
  lastSessionDate: Date | null;
  breakTime: number;
  totalBreaks: number;
  sessionBreaks: number;
  sessionBreakTime: number;
  breakTimerStart: Date | null;
}

const TimerSchema = new Schema<ITimerData>(
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
    startTime: {
      type: [Number],
      default: []
    },
    initiationTime: {
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
      type: [Number],
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

export default model<ITimerData>("Timer data", TimerSchema);
