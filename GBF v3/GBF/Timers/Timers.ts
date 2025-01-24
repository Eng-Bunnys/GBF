import { type Snowflake } from "discord.js";
import { type ITimerData } from "../../Models/Timer/TimerTypes";
import { TimerModel } from "../../Models/Timer/TimerModel";
import { type GBFUser } from "../../Models/User/UserTypes";
import { UserModel } from "../../Models/User/UserModel";
import { TimerStats } from "./TimerStats";
import { msToTime } from "../../Handler";
import { xpRequired } from "./LevelEngine";

export class Timers {
  public readonly userID: Snowflake;
  public timerData: ITimerData;
  public userData: GBFUser;
  private isDataLoaded: boolean;

  constructor(userID: Snowflake) {
    this.userID = userID;

    this.isDataLoaded = false;
    this.timerData = null;
  }

  public static async create(userID: Snowflake): Promise<Timers> {
    const instance = new Timers(userID);
    await instance.setUser();
    return instance;
  }

  private async setUser() {
    this.timerData = await TimerModel.findByUserID(this.userID);
    this.userData = await UserModel.findOne({
      userID: this.userID,
    });

    this.isDataLoaded = true;
  }

  public checkUser() {
    if (!this.isDataLoaded)
      throw new Error(
        "User data not loaded, make sure to load it using the create method"
      );

    if (this.timerData === null || this.userData === null)
      throw new Error("User data not found");
  }

  public checkSemester() {
    this.checkUser();

    if (this.timerData.currentSemester.semesterName === null)
      throw new Error("Semester data not found");
  }

  public statDisplay() {
    const timerStats = new TimerStats(this.timerData, this.userData);

    let gap = "\n\n\n";

    let stats = "";

    let accountDetails = "";

    accountDetails += `• Lifetime Study Time: ${
      timerStats.getTotalStudyTime() !== 0
        ? msToTime(timerStats.getTotalStudyTime())
        : "No Data"
    }\n`;

    accountDetails += `• Semester Study Time: ${
      timerStats.getSemesterTime() !== 0
        ? msToTime(timerStats.getSemesterTime())
        : "No Data"
    }\n`;

    accountDetails += `• Average Session Time: ${
      timerStats.getAverageSessionTime() !== 0
        ? msToTime(timerStats.getAverageSessionTime())
        : "No Data"
    }\n`;

    accountDetails += `• Total Sessions: ${timerStats.getSessionCount()}\n`;

    stats += accountDetails + gap;

    let recordDetails = "";

    recordDetails += `• Longest Session: ${
      timerStats.getLongestSessionTime() !== 0
        ? msToTime(timerStats.getLongestSessionTime())
        : "No Data"
    }\n`;

    recordDetails += `• Longest Semester: ${msToTime(
      timerStats.getLongestSemester().semesterTime * 1000
    )} [${timerStats.getLongestSemester().semesterTime / 3600}] - [${
      timerStats.getLongestSemester().semesterName
    }]\n`;

    stats += recordDetails + gap;

    let semesterBreakDetails = "";

    semesterBreakDetails += `• Semester Break Time: ${
      timerStats.getBreakTime() !== 0
        ? msToTime(timerStats.getBreakTime())
        : "No Data"
    }\n`;

    semesterBreakDetails += `• Total Breaks: ${timerStats.getBreakCount()}\n`;

    semesterBreakDetails += `• Average Break Time: ${
      timerStats.getAverageBreakTime() !== 0
        ? msToTime(timerStats.getAverageBreakTime())
        : "No Data"
    }\n`;

    semesterBreakDetails += `• Average Time Between Breaks: ${
      timerStats.getAverageTimeBetweenBreaks() !== 0
        ? msToTime(timerStats.getAverageTimeBetweenBreaks())
        : "No Data"
    }\n`;

    stats += semesterBreakDetails + gap;

    let averageDetails = "";

    averageDetails += `• Average Start Time: ${
      timerStats.getAverageStartTimeUNIX() !== null
        ? `<t:${timerStats.getAverageStartTimeUNIX()}:T>`
        : "No Data"
    }`;

    averageDetails += `• Average Session Time / Week: ${
      timerStats.getAverageTimePerWeek() !== 0
        ? msToTime(timerStats.getAverageTimePerWeek()) +
          "[" +
          timerStats.getAverageTimePerWeek() / 3600 +
          "]"
        : "No Data"
    }`;

    stats += averageDetails + gap;

    let subjectDetails = "";

    subjectDetails += `• Total Subjects: ${timerStats.getSubjectCount()}\n`;

    subjectDetails += `• Most Studied Subject: ${
      timerStats.getMostStudiedSubject() !== "No Data"
        ? timerStats.getMostStudiedSubject()
        : "No Data"
    }\n`;

    subjectDetails += `• Least Studied Subject: ${
      timerStats.getLeastStudiedSubject() !== "No Data"
        ? timerStats.getLeastStudiedSubject()
        : "No Data"
    }\n`;

    subjectDetails += `• Average Study Time Per Subject: ${
      timerStats.getAverageStudyTimePerSubject() !== 0
        ? msToTime(timerStats.getAverageStudyTimePerSubject())
        : "No Data"
    }\n`;

    stats += subjectDetails + gap;

    let levelDetails = "";

    levelDetails += `• Semester Level: ${timerStats.getSemesterLevel()}\n`;

    levelDetails += `• XP to reach level ${
      timerStats.getSemesterLevel() + 1
    }: ${
      timerStats.getSemesterXP() +
      "/" +
      xpRequired(timerStats.getSemesterLevel() + 1)
    }\n`;

    const percentageCompleteSemester = timerStats.percentageToNextLevel();
    levelDetails += `${timerStats.generateProgressBar(
      percentageCompleteSemester
    )}\n`;

    levelDetails += ``;
  }
}
