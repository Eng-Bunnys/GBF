import { Schema, model, Document } from "mongoose";

interface Account {
  userID: string;
  lifetimeTime: number;
  longestSessionTime: number;
  longestSemester: Semester;
}

interface Subject {
  subjectName: string;
  timesStudied: number;
}

interface Semester {
  semesterName: string;
  semesterLevel: number;
  semesterXP: number;
  semesterTime: number;
  semesterSubjects: Subject[];
  sessionStartTimes: number[];
  totalBreakTime: number;
}

interface SessionBreak {
  sessionBreakTime: number;
  sessionBreakStart: Date | null;
}

interface Session {
  guildID: string;
  messageID: string;
  sessionStartTime: Date | null;
  sessionTopic: string;
  sessionTime: number;
  sessionBreaks: SessionBreak[];
}

interface ITimerData extends Document {
  account: Account;
  currentSemester: Semester;
  sessionData: Session[];
}

const SubjectSchema = new Schema({
  subjectName: { type: String, required: true },
  timesStudied: { type: Number, default: 0 },
});

const SemesterSchema = new Schema({
  semesterName: { type: String, required: true },
  semesterLevel: { type: Number, required: true },
  semesterXP: { type: Number, default: 0 },
  semesterTime: { type: Number, default: 0 },
  semesterSubjects: { type: [SubjectSchema], default: [] },
  sessionStartTimes: { type: [Number], default: [] },
  totalBreakTime: { type: Number, default: 0 },
});

const SessionBreakSchema = new Schema({
  sessionBreakTime: { type: Number, default: 0 },
  sessionBreakStart: { type: Date, default: null },
});

const SessionSchema = new Schema({
  guildID: { type: String, required: true },
  messageID: { type: String, required: true },
  sessionStartTime: { type: Date, default: null },
  sessionTopic: { type: String, required: true },
  sessionTime: { type: Number, default: 0 },
  sessionBreaks: { type: [SessionBreakSchema], default: [] },
});

const AccountSchema = new Schema({
  userID: { type: String, required: true },
  lifetimeTime: { type: Number, default: 0 },
  longestSessionTime: { type: Number, default: 0 },
  longestSemester: { type: SemesterSchema, required: true },
});

const ITimerDataSchema = new Schema(
  {
    account: { type: AccountSchema, required: true },
    currentSemester: { type: SemesterSchema, required: true },
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
