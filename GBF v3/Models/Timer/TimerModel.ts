import { Schema, model, Document } from "mongoose";
import { Subject } from "../../GBF/Timers/GradeEngine";
import { Account, Semester, Session, SessionBreak } from "./TimerTypes";

interface ITimerData extends Document {
  account: Account;
  currentSemester: Semester;
  sessionData: Session;
}

const SubjectSchema = new Schema<Subject>(
  {
    subjectName: { type: String, default: null },
    subjectCode: { type: String, default: null },
    timesStudied: { type: Number, default: 0 },
    creditHours: { type: Number, default: null },
    grade: { type: String, default: null },
    marksLost: { type: Number, default: 0 },
  },
  {
    _id: false,
  }
);

const SemesterSchema = new Schema<Semester>(
  {
    semesterName: { type: String, default: null },
    semesterLevel: { type: Number, default: 1 },
    semesterXP: { type: Number, default: 0 },
    semesterTime: { type: Number, default: 0 },
    semesterSubjects: { type: [SubjectSchema], default: [] },
    sessionStartTimes: { type: [Number], default: [] },
    totalBreakTime: { type: Number, default: 0 },
    breakCount: { type: Number, default: 0 },
    longestSession: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
  },
  {
    _id: false,
  }
);

const SessionBreakSchema = new Schema<SessionBreak>(
  {
    sessionBreakTime: { type: Number, default: 0 },
    sessionBreakStart: { type: Date, default: null },
  },
  {
    _id: false,
  }
);

const SessionSchema = new Schema<Session>(
  {
    guildID: { type: String },
    channelID: { type: String },
    messageID: { type: String },
    sessionStartTime: { type: Date, default: null },
    sessionTopic: { type: String },
    sessionTime: { type: Number, default: 0 },
    numberOfBreaks: { type: Number, default: 0 },
    sessionBreaks: { type: SessionBreakSchema, default: () => ({}) },
    lastSessionTopic: { type: String, default: null },
    lastSessionDate: { type: Date, default: null },
  },
  {
    _id: false,
  }
);

const AccountSchema = new Schema<Account>(
  {
    userID: { type: String, required: true },
    lifetimeTime: { type: Number, default: 0 },
    longestSessionTime: { type: Number, default: 0 },
    longestSemester: { type: SemesterSchema, default: null },
  },
  {
    _id: false,
  }
);

const ITimerDataSchema = new Schema<ITimerData>(
  {
    account: { type: AccountSchema, required: true },
    currentSemester: { type: SemesterSchema, default: () => ({}) },
    sessionData: { type: SessionSchema, default: () => ({}) },
  },
  {
    collection: "Timer Data",
  }
);

const TimerModel = model<ITimerData>("Timer Data", ITimerDataSchema);

export {
  TimerModel,
  ITimerData,
  Account,
  Semester,
  Subject,
  Session,
  SessionBreak,
};
