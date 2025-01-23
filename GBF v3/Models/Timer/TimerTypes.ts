import { type Snowflake } from "discord.js";

/**
 * Represents an account with user-specific study data
 */
interface Account {
  /**
   * The unique Discord user ID
   * @type {Snowflake}
   */
  userID: Snowflake;

  /**
   * The total time the user has spent studying, in seconds
   * @type {number}
   */
  lifetimeTime: number;

  /**
   * The longest duration the user has studied in a single session, in seconds
   * @type {number}
   */
  longestSessionTime: number;

  /**
   * The longest semester the user had
   * @type {Semester}
   */
  longestSemester: Semester;
}

/**
 * Represents a subject in a semester with study statistics
 */
interface Subject {
  /**
   * The name of the subject
   * @type {string}
   */
  subjectName: string;

  /**
   * The number of times the user has studied this subject
   * @type {number}
   */
  timesStudied: number;
}

/**
 * Represents a semester with related data such as level, XP, and study time
 */
interface Semester {
  /**
   * The name of the semester
   * @type {string}
   */
  semesterName: string;

  /**
   * The level of the semester (e.g., 1 for first year, 2 for second year, etc.)
   * @type {number}
   */
  semesterLevel: number;

  /**
   * The total XP earned in the semester
   * @type {number}
   */
  semesterXP: number;

  /**
   * The total study time in the semester, in seconds
   * @type {number}
   */
  semesterTime: number;

  /**
   * An array of subjects that are part of the semester
   * @type {Subject[]}
   */
  semesterSubjects: Subject[];

  /**
   * An array of timestamps representing the start times of sessions during the semester
   * @type {number[]}
   */
  sessionStartTimes: number[];

  /**
   * The total break time taken during the semester, in seconds
   * @type {number}
   */
  totalBreakTime: number;
}

/**
 * Represents a break taken during a study session
 */
interface SessionBreak {
  /**
   * The duration of the session break, in seconds
   * @type {number}
   */
  sessionBreakTime: number;

  /**
   * The start time of the session break
   * @type {Date | null}
   */
  sessionBreakStart: Date | null;
}

/**
 * Represents a single study session
 */
interface Session {
  /**
   * The Discord guild (server) ID associated with the session
   * @type {Snowflake}
   */
  guildID: Snowflake;

  /**
   * The unique Discord message ID for the session's message
   * @type {Snowflake}
   */
  messageID: Snowflake;

  /**
   * The start time of the session
   * @type {Date | null}
   */
  sessionStartTime: Date | null;

  /**
   * The topic or focus of the session
   * @type {string}
   */
  sessionTopic: string;

  /**
   * The duration of the session, in seconds
   * @type {number}
   */
  sessionTime: number;

  /**
   * An array of session breaks taken during the session
   * @type {SessionBreak[]}
   */
  sessionBreaks: SessionBreak[];
}

/**
 * Represents the timer data for a user, including account information, current semester, and session data
 * Extends the Mongoose Document interface to interact with MongoDB
 */
interface ITimerData extends Document {
  /**
   * The account information for the user
   * @type {Account}
   */
  account: Account;

  /**
   * The current semester data for the user
   * @type {Semester}
   */
  currentSemester: Semester;

  /**
   * An array of sessions tracked for the user
   * @type {Session[]}
   */
  sessionData: Session[];
}

export { Account, Subject, Semester, SessionBreak, Session, ITimerData };
