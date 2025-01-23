import { Schema, model, Model } from "mongoose";
import { z } from "zod";
import {
  Account,
  ITimerData,
  Semester,
  Session,
  SessionBreak,
  Subject,
} from "./TimerTypes";

const subjectSchema = z.object({
  subjectName: z
    .string()
    .min(1, "Subject name is required")
    .max(100, "Subject name too long"),
  timesStudied: z.number().int().min(0, "Times studied cannot be negative"),
});

const sessionBreakSchema = z.object({
  sessionBreakTime: z.number().int().min(0, "Break time cannot be negative"),
  sessionBreakStart: z.date().nullable(),
});

const semesterSchema = z.object({
  semesterName: z
    .string()
    .min(1, "Semester name is required")
    .max(50, "Semester name too long"),
  semesterLevel: z.number().int().min(1, "Semester level must be at least 1"),
  semesterXP: z.number().int().min(0, "XP cannot be negative"),
  semesterTime: z.number().int().min(0, "Semester time cannot be negative"),
  semesterSubjects: z.array(subjectSchema).max(20, "Too many subjects"),
  sessionStartTimes: z.array(z.number()),
  totalBreakTime: z
    .number()
    .int()
    .min(0, "Total break time cannot be negative"),
});

const sessionSchema = z.object({
  guildID: z.string().min(1, "Guild ID is required"),
  messageID: z.string().min(1, "Message ID is required"),
  sessionStartTime: z.date().nullable(),
  sessionTopic: z
    .string()
    .min(1, "Session topic is required")
    .max(200, "Session topic too long"),
  sessionTime: z.number().int().min(0, "Session time cannot be negative"),
  sessionBreaks: z.array(sessionBreakSchema).max(50, "Too many session breaks"),
});

const accountSchema = z.object({
  userID: z.string().min(1, "User ID is required"),
  lifetimeTime: z.number().int().min(0, "Lifetime time cannot be negative"),
  longestSessionTime: z
    .number()
    .int()
    .min(0, "Longest session time cannot be negative"),
  longestSemester: semesterSchema,
});

const timerDataSchema = z.object({
  account: accountSchema,
  currentSemester: semesterSchema,
  sessionData: z.array(sessionSchema),
});

const MongoSubjectSchema = new Schema<Subject>(
  {
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      index: true,
    },
    timesStudied: {
      type: Number,
      default: 0,
      min: [0, "Times studied cannot be negative"],
    },
  },
  { _id: false }
);

const MongoSessionBreakSchema = new Schema<SessionBreak>(
  {
    sessionBreakTime: {
      type: Number,
      default: 0,
      min: [0, "Break time cannot be negative"],
    },
    sessionBreakStart: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const MongoSemesterSchema = new Schema<Semester>(
  {
    semesterName: {
      type: String,
      required: [true, "Semester name is required"],
      trim: true,
      index: true,
    },
    semesterLevel: {
      type: Number,
      required: [true, "Semester level is required"],
      min: [1, "Semester level must be at least 1"],
    },
    semesterXP: {
      type: Number,
      default: 0,
      min: [0, "XP cannot be negative"],
    },
    semesterTime: {
      type: Number,
      default: 0,
      min: [0, "Semester time cannot be negative"],
    },
    semesterSubjects: {
      type: [MongoSubjectSchema],
      default: [],
      validate: [
        {
          validator: (v: Subject[]) => v.length <= 20,
          message: "Maximum 20 subjects allowed",
        },
      ],
    },
    sessionStartTimes: {
      type: [Number],
      default: [],
    },
    totalBreakTime: {
      type: Number,
      default: 0,
      min: [0, "Total break time cannot be negative"],
    },
  },
  { _id: false }
);

const MongoSessionSchema = new Schema<Session>({
  guildID: {
    type: String,
    required: [true, "Guild ID is required"],
    index: true,
  },
  messageID: {
    type: String,
    required: [true, "Message ID is required"],
    unique: true,
  },
  sessionStartTime: {
    type: Date,
    default: null,
  },
  sessionTopic: {
    type: String,
    required: [true, "Session topic is required"],
    trim: true,
  },
  sessionTime: {
    type: Number,
    default: 0,
    min: [0, "Session time cannot be negative"],
  },
  sessionBreaks: {
    type: [MongoSessionBreakSchema],
    default: [],
  },
});

const MongoAccountSchema = new Schema<Account>({
  userID: {
    type: String,
    required: [true, "User ID is required"],
    index: true,
  },
  lifetimeTime: {
    type: Number,
    default: 0,
    min: [0, "Lifetime time cannot be negative"],
  },
  longestSessionTime: {
    type: Number,
    default: 0,
    min: [0, "Longest session time cannot be negative"],
  },
  longestSemester: MongoSemesterSchema,
});

const MongoTimerDataSchema = new Schema<ITimerData, TimerDataModel>(
  {
    account: {
      type: MongoAccountSchema,
      required: [true, "Account information is required"],
      validate: {
        validator: function (v: Account) {
          try {
            accountSchema.parse(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid account data",
      },
    },
    currentSemester: {
      type: MongoSemesterSchema,
      required: [true, "Current semester is required"],
      validate: {
        validator: function (v: Semester) {
          try {
            semesterSchema.parse(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid semester data",
      },
    },
    sessionData: {
      type: [MongoSessionSchema],
      default: [],
      validate: [
        {
          validator: (v: Session[]) => v.length <= 1000,
          message: "Maximum 1000 session records allowed",
        },
      ],
    },
  },
  {
    collection: "Timer Data",
    timestamps: true,
    optimisticConcurrency: true,
  }
);

// Static Methods
MongoTimerDataSchema.statics.findByUserID = function (userID: string) {
  return this.findOne({ "account.userID": userID });
};

MongoTimerDataSchema.statics.createOrUpdateTimer = async function (
  userID: string,
  updateData: Partial<ITimerData>
) {
  return this.findOneAndUpdate({ "account.userID": userID }, updateData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
};

// Instance Methods
MongoTimerDataSchema.methods.calculateTotalStudyTime = function () {
  return this.sessionData.reduce(
    (total, session) => total + session.sessionTime,
    0
  );
};

MongoTimerDataSchema.methods.getMostStudiedSubjects = function (limit = 5) {
  const subjectStudyCount = new Map<string, number>();

  this.currentSemester.semesterSubjects.forEach((subject) => {
    const totalStudyTime = this.sessionData
      .filter(
        (session) =>
          session.sessionTopic.toLowerCase() ===
          subject.subjectName.toLowerCase()
      )
      .reduce((total, session) => total + session.sessionTime, 0);

    subjectStudyCount.set(subject.subjectName, totalStudyTime);
  });

  return Array.from(subjectStudyCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
};

// Middleware
MongoTimerDataSchema.pre("save", function (next) {
  // Update longest session and semester logic
  const currentSessionTime = this.sessionData.reduce(
    (max, session) => Math.max(max, session.sessionTime),
    0
  );

  if (currentSessionTime > this.account.longestSessionTime) {
    this.account.longestSessionTime = currentSessionTime;
  }

  next();
});

// Model Creation
interface TimerDataModel extends Model<ITimerData> {
  findByUserID(userID: string): Promise<ITimerData | null>;
  createOrUpdateTimer(
    userID: string,
    updateData: Partial<ITimerData>
  ): Promise<ITimerData>;
}

const TimerModel = model<ITimerData, TimerDataModel>(
  "Timer Data",
  MongoTimerDataSchema
);

export {
  TimerModel,
  ITimerData,
  Account,
  Semester,
  Subject,
  Session,
  SessionBreak,
  subjectSchema,
  semesterSchema,
  sessionSchema,
  accountSchema,
  timerDataSchema,
};
