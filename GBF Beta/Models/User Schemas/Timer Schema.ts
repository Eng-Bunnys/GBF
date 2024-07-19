import { Snowflake } from "discord.js";
import { Schema, model } from "mongoose";

interface ITimerData {
  /**
   * The user's ID
   * @type {Snowflake}
   */
  userID: string;
  /**
   * The initiation message ID
   * @type {Snowflake}
   */
  messageID: string;
  /**
   * The total time the user spent in a session [Lifetime]
   * @type {number}
   * @unit Seconds
   */
  TotalTime: number;
  /**
   * The current season name
   * @type {string}
   */
  SeasonName: string;
  /**
   * The user's active season level
   * @type {number}
   */
  SeasonLevel: number;
  /**
   * The user's active season acquired XP
   * @type {number}
   */
  SeasonXP: number;
  /**
   * An array of the timestamps that the user started their timer
   * @type {number[]}
   */
  StartTime: number[];
  /**
   * The time that the user started the timer on
   * @type {Date | null}
   */
  InitiationTime: Date | null;
  /**
   * The topic of the active session
   * @type {string}
   */
  SessionTopic: string;
  /**
   * The total number of sessions for the active season
   * @type {number}
   */
  NumberOfSessions: number;
  /**
   * The time spent in sessions in the active season
   * @type {number}
   * @unit Seconds
   */
  TimeSpent: number;
  /**
   * The longest session in the active season
   * @type {number}
   * @unit Seconds
   */
  LongestSession: number;
  /**
   * The longest season
   * @type {number}
   * @unit Seconds
   */
  LongestSeason: number;
  /**
   * The name of the longest season
   * @type {string}
   */
  LongestSeasonName: string;
  /**
   * An array of the lengths of all of the sessions in the active season
   * @type {number[]}
   */
  SessionLengths: number[];
  /**
   * The time spent in the user's last session
   * @type {number | null}
   * @unit Seconds
   */
  LastSessionTime: number | null;
  /**
   * The date of the last session
   * @type {Date | null}
   */
  LastSessionDate: Date | null;
  /**
   * The time spent paused in the active season
   * @type {number}
   */
  TimePaused: number;
  /**
   * The total number of breaks in the active season
   * @type {number}
   */
  TotalBreaks: number;
  /**
   * The number of breaks taken in the active season
   * @type {number}
   */
  SessionPauses: number;
  /**
   * The amount of time spent paused in the active session
   * @type {Date}
   * @unit Seconds
   */
  SessionPauseTime: Date;
  /**
   * The date the user started the pause
   * @type {Date | null}
   */
  BreakTimerInitiate: Date | null;
}

const TimerSchema = new Schema<ITimerData>(
  {
    userID: String,
    messageID: String,
    TotalTime: Number,
    SeasonName: String,
    SeasonLevel: {
      type: Number,
      default: 1,
    },
    SeasonXP: {
      type: Number,
      default: 0,
    },
    StartTime: {
      type: [Number],
      default: [],
    },
    InitiationTime: {
      type: Date,
      default: null,
    },
    SessionTopic: String,
    NumberOfSessions: {
      type: Number,
      default: 0,
    },
    TimeSpent: {
      type: Number,
      default: 0,
    },
    LongestSession: {
      type: Number,
      default: 0,
    },
    LongestSeason: {
      type: Number,
      default: 0,
    },
    LongestSeasonName: {
      type: String,
      default: "N.A.",
    },
    SessionLengths: {
      type: [Number],
      default: [],
    },
    LastSessionTime: {
      type: Number,
      default: null,
    },
    LastSessionDate: {
      type: Date,
      default: null,
    },
    TimePaused: {
      type: Number,
      default: 0,
    },
    TotalBreaks: {
      type: Number,
      default: 0,
    },
    SessionPauses: {
      type: Number,
      default: 0,
    },
    SessionPauseTime: {
      type: Date,
      default: null,
    },
    BreakTimerInitiate: Date,
  },
  {
    collection: "Timer Data",
  }
);

const TimerModel = model<ITimerData>("Timer Data", TimerSchema);

export { TimerModel, ITimerData };
