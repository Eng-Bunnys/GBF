import { Schema, model, Document } from "mongoose";
import { Subject } from "../../GBF/Timers/GradeEngine";
import { Account, Semester, Session, SessionBreak } from "./TimerTypes";

interface ITimerData extends Document {
  account: Account;
  currentSemester: Semester;
  sessionData: Session[];
}

const SubjectSchema = new Schema({
  subjectName: { type: String, default: null },
  subjectCode: { type: String, default: null },
  timesStudied: { type: Number, default: 0 },
  creditHours: { type: Number },
  grade: { type: String },
  marksLost: { type: Number, default: 0 },
});

const SemesterSchema = new Schema({
  semesterName: { type: String, default: null },
  semesterLevel: { type: Number, default: 1 },
  semesterXP: { type: Number, default: 0 },
  semesterTime: { type: Number, default: 0 },
  semesterSubjects: { type: [SubjectSchema], default: [] },
  sessionStartTimes: { type: [Number], default: [] },
  totalBreakTime: { type: Number, default: 0 },
  breakCount: { type: Number, default: 0 },
  longestSession: { type: Number, default: 0 },
});

const SessionBreakSchema = new Schema({
  sessionBreakTime: { type: Number, default: 0 },
  sessionBreakStart: { type: Date, default: null },
});

const SessionSchema = new Schema({
  guildID: { type: String },
  messageID: { type: String },
  sessionStartTime: { type: Date, default: null },
  sessionTopic: { type: String },
  sessionTime: { type: Number, default: 0 },
  sessionBreaks: { type: [SessionBreakSchema], default: [] },
  lastSessionTopic: { type: String, default: null },
  lastSessionDate: { type: Date, default: null },
});

const AccountSchema = new Schema({
  userID: { type: String, required: true },
  lifetimeTime: { type: Number, default: 0 },
  longestSessionTime: { type: Number, default: 0 },
  longestSemester: { type: SemesterSchema, default: null },
});

const ITimerDataSchema = new Schema(
  {
    account: { type: AccountSchema, required: true },
    currentSemester: { type: SemesterSchema, default: () => ({}) },
    sessionData: { type: [SessionSchema], default: [] },
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
