import { type Snowflake } from "discord.js";
import { Semester, type ITimerData } from "../../Models/Timer/TimerTypes";
import { TimerModel } from "../../Models/Timer/TimerModel";
import { type GBFUser } from "../../Models/User/UserTypes";
import { UserModel } from "../../Models/User/UserModel";
import { TimerStats } from "./TimerStats";
import { msToTime, nullifyObjectInPlace } from "../../Handler";
import {
  calculateTotalSeasonXP,
  checkRank,
  convertSeasonLevel,
  hoursRequired,
  rpRequired,
  xpRequired,
} from "./LevelEngine";
import { Subject } from "./GradeEngine";
import { Document } from "mongoose";
import { client } from "../..";
import { CustomEvents } from "../ClientEvents";

export class Timers {
  public readonly userID: Snowflake;
  public timerData: (ITimerData & Document) | null = null;
  public userData: (GBFUser & Document) | null = null;
  private isDataLoaded: boolean = false;

  constructor(userID: Snowflake) {
    this.userID = userID;
  }

  /// Functions to ensure the system is working properly

  /**
   * Creates a new instance of the Timers class for the specified user
   *
   * @param userID - The unique identifier of the user
   * @returns A promise that resolves to an instance of the Timers class
   */
  public static async create(userID: Snowflake): Promise<Timers> {
    const instance = new Timers(userID);
    await instance.setUser();
    return instance;
  }

  private async setUser() {
    this.timerData = await TimerModel.findOne({
      "account.userID": this.userID,
    });
    this.userData = await UserModel.findOne({
      userID: this.userID,
    });

    this.isDataLoaded = true;
  }

  private checkUser() {
    if (!this.isDataLoaded)
      throw new Error(
        `User data not loaded. Call 'create' to initialize Timers for userID: ${this.userID}`
      );

    if (!this.timerData && !this.userData)
      throw new Error(`Data not found for userID: ${this.userID}`);
  }

  private checkSemester() {
    this.checkUser();

    if (!this.timerData!.currentSemester.semesterName)
      throw new Error(`Semester data not found for userID: ${this.userID}`);
  }

  /// Setters and Getters

  /**
   * Adds a new subject to the user's subjects list and saves the updated user data
   *
   * @param {Subject} subject - The subject to be added
   * @returns {Promise<void>} A promise that resolves when the user data has been saved
   * @throws Will throw an error if the subject already exists in the user's account or current semester
   */
  public async addSubjectAccount(subject: Subject): Promise<void> {
    this.checkUser();

    // Check if the subject already exists in the user's account
    if (
      this.userData!.Subjects.some((s) => s.subjectName === subject.subjectName)
    ) {
      throw new Error(
        `Subject '${subject.subjectName}' already exists for userID: ${this.userID} in the account subjects list`
      );
    }

    // Check if the subject exists in the current semester
    if (
      this.timerData?.currentSemester?.semesterSubjects.some(
        (s) => s.subjectName === subject.subjectName
      )
    ) {
      throw new Error(
        `Subject '${subject.subjectName}' already exists for userID: ${this.userID} in the current semester`
      );
    }

    this.userData.Subjects.push(subject);
    await this.userData!.save();
  }

  /**
   * Adds a subject to the current semester's list of subjects
   *
   * @param {Subject} subject - The subject to be added to the current semester
   * @returns {Promise<void>} A promise that resolves when the subject has been added and the data has been saved
   * @throws Will throw an error if the subject already exists in the current semester or user's account
   */
  public async addSubjectSemester(subject: Subject): Promise<void> {
    this.checkSemester();

    // Check if the subject already exists in the current semester
    if (
      this.timerData!.currentSemester.semesterSubjects.some(
        (s) => s.subjectName === subject.subjectName
      )
    ) {
      throw new Error(
        `Subject '${subject.subjectName}' already exists for userID: ${this.userID} in the current semester`
      );
    }

    // Check if the subject exists in the user's account
    if (
      this.userData?.Subjects.some((s) => s.subjectName === subject.subjectName)
    ) {
      throw new Error(
        `Subject '${subject.subjectName}' already exists for userID: ${this.userID} in the account subjects list`
      );
    }

    this.timerData!.currentSemester.semesterSubjects.push(subject);
    await this.timerData!.save();
  }

  /**
   * Removes a subject from the user's subjects list by name and saves the updated user data
   *
   * @param {string} subjectName - The name of the subject to be removed
   * @returns {Promise<void>} A promise that resolves when the user data has been saved
   * @throws Will throw an error if the subject is not found or if the user is not authenticated
   */
  public async removeSubjectAccount(subjectName: string): Promise<void> {
    this.checkUser();

    const index = this.userData!.Subjects.findIndex(
      (s) => s.subjectName.toLowerCase() === subjectName.toLowerCase()
    );

    if (index === -1) {
      throw new Error(
        `Subject '${subjectName}' does not exist for userID: ${this.userID}`
      );
    }

    this.userData.Subjects.splice(index, 1);

    await this.userData!.save();
  }

  /**
   * Removes a subject from the user's subjects list by name and saves the updated user data
   *
   * @param {string} subjectName - The name of the subject to be removed
   * @returns {Promise<void>} A promise that resolves when the user data has been saved
   * @throws Will throw an error if the subject is not found or if the user is not authenticated
   */
  public async removeSubjectSemester(subjectName: string): Promise<void> {
    this.checkSemester();

    const index = this.timerData.currentSemester!.semesterSubjects.findIndex(
      (s) => s.subjectName.toLowerCase() === subjectName.toLowerCase()
    );

    if (index === -1) {
      throw new Error(
        `Subject '${subjectName}' does not exist for userID: ${this.userID}`
      );
    }

    this.timerData.currentSemester.semesterSubjects.splice(index, 1);

    await this.timerData!.save();
  }

  public getSemesterName(): string {
    this.checkSemester();
    return this.timerData!.currentSemester.semesterName;
  }

  /// Command functions

  public async register(semesterName?: string): Promise<boolean> {
    if (semesterName && semesterName.trim() === "")
      throw new Error("Semester name cannot be empty");

    try {
      if (!this.userData) await this.registerUser();

      if (semesterName) await this.registerSemester(semesterName);

      return true;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  private async registerUser() {
    if (this.userData)
      throw new Error(
        `An existing account already exists for user ID '${this.userID}'`
      );

    this.userData = new UserModel({
      userID: this.userID,
      Subjects: [],
    });

    await this.userData.save();
  }

  private async registerSemester(semesterName: string) {
    this.checkUser();

    if (this.timerData) {
      if (this.timerData.currentSemester.semesterName)
        throw new Error(
          `Semester '${this.timerData.currentSemester.semesterName}' is already active, end it before you can start a new one.`
        );
      else {
        // Resetting the data just in-case
        this.endSemester();

        this.timerData.currentSemester.semesterName = semesterName;

        await this.timerData!.save();
      }
    } else {
      const newData = new TimerModel({
        "account.userID": this.userID,
        "currentSemester.semesterName": semesterName,
      });

      this.timerData = newData as ITimerData & Document;

      await this.timerData!.save();
    }
  }

  public statDisplay() {
    this.checkUser();

    const timerStats = new TimerStats(this.timerData, this.userData);

    let gap = "\n\n\n";

    let stats = "";

    let accountDetails = "";

    accountDetails += `• Lifetime Study Time: ${
      timerStats.getTotalStudyTime() !== 0
        ? msToTime(timerStats.getTotalStudyTime())
        : "No Data"
    }\n`;

    if (this.timerData.currentSemester.semesterName) {
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
    }
    stats += accountDetails + gap;

    let recordDetails = "";

    if (this.timerData.currentSemester.semesterName)
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

    if (this.timerData.currentSemester.semesterName) {
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
    }
    let subjectDetails = "";

    subjectDetails += `• Total Subjects: ${timerStats.getSubjectCount()}\n`;

    if (this.timerData.currentSemester.semesterName) {
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
    }
    stats += subjectDetails + gap;

    let levelDetails = "";

    let xpToNextLevel = 0;

    if (this.timerData.currentSemester.semesterName)
      xpToNextLevel = xpRequired(timerStats.getSemesterLevel() + 1);

    const rpToNextLevel = rpRequired(timerStats.getAccountLevel() + 1);

    if (this.timerData.currentSemester.semesterName) {
      levelDetails += `• Semester Level: ${timerStats.getSemesterLevel()}\n`;

      levelDetails += `• XP to reach level ${
        timerStats.getSemesterLevel() + 1
      }: ${timerStats.getSemesterXP() + "/" + xpToNextLevel}\n`;

      const percentageCompleteSemester = timerStats.percentageToNextLevel();
      levelDetails += `${timerStats.generateProgressBar(
        percentageCompleteSemester
      )}\n`;

      levelDetails += `• Hours to reach level ${
        timerStats.getSemesterLevel() + 1
      }: ${hoursRequired(xpToNextLevel - timerStats.getSemesterXP())}\n`;
    }
    levelDetails += `• Account Level: ${timerStats.getAccountLevel()}\n`;

    levelDetails += `• RP to reach level ${
      timerStats.getAccountLevel() + 1
    }: ${timerStats.getAccountRP()}/${rpToNextLevel}\n`;

    const percentageCompleteAccount = timerStats.percentageToNextRank();

    levelDetails += `${timerStats.generateProgressBar(
      percentageCompleteAccount
    )}\n`;

    levelDetails += `• Hours to reach level ${
      timerStats.getAccountLevel() + 1
    }: ${hoursRequired(rpToNextLevel - timerStats.getAccountRP())}\n`;

    stats += levelDetails + gap;

    levelDetails += `• GPA: ${timerStats.GPA()}`;

    return stats;
  }

  public GPAMenu() {
    this.checkUser();

    const timerStats = new TimerStats(this.timerData, this.userData);

    let subjectsList = "";

    this.userData.Subjects.forEach((subject) => {
      subjectsList += `• ${subject.subjectName} - ${subject.grade}\n`;
    });

    const formattedGPA = parseFloat(timerStats.GPA().toPrecision(3));

    subjectsList += `• GPA: ${formattedGPA}`;

    return subjectsList;
  }

  public async endSemester() {
    this.checkSemester();

    const convertedXP =
      convertSeasonLevel(this.timerData.currentSemester.semesterLevel) +
      this.timerData.currentSemester.semesterXP;

    let semesterRecap = `• Semester: ${
      this.timerData.currentSemester.semesterName
    }\n
    • Total Time: ${msToTime(
      this.timerData.currentSemester.semesterTime * 1000
    )}\n
    • Number of Sessions: ${
      this.timerData.currentSemester.sessionStartTimes.length
    }\n
    • Total Break Time: ${msToTime(
      this.timerData.currentSemester.totalBreakTime * 1000
    )}\n
    • Longest Session: ${msToTime(
      this.timerData.currentSemester.longestSession * 1000
    )}\n
    • Semester Level: ${this.timerData.currentSemester.semesterLevel}\n
    • Semester XP: ${(
      this.timerData.currentSemester.semesterXP +
      calculateTotalSeasonXP(this.timerData.currentSemester.semesterXP)
    ).toLocaleString("en-US")}\n
    • Account XP Converted: ${convertedXP.toLocaleString("en-US")}`;

    // Checking if the current semester time is higher than the previous record
    if (
      this.timerData.account.longestSemester.semesterTime <
      this.timerData.currentSemester.semesterTime
    ) {
      this.timerData.account.longestSemester = this.timerData.currentSemester;

      client.emit(
        CustomEvents.SemesterUpdated,
        this.timerData.account.userID,
        this.timerData.currentSemester
      );
    }

    // Updating the account info before deleting the data

    this.timerData.account.lifetimeTime +=
      this.timerData.currentSemester.semesterTime;

    const rankUpCheck = checkRank(
      this.userData.Rank,
      this.userData.RP,
      convertedXP
    );

    if (rankUpCheck[0])
      client.emit(
        CustomEvents.AccountLevelUp,
        this.timerData.account.userID,
        rankUpCheck[1],
        rankUpCheck[2]
      );
    else this.userData.RP += convertedXP;

    const resetSemester: Semester = {
      breakCount: 0,
      longestSession: null,
      semesterLevel: 1,
      semesterName: null,
      semesterSubjects: [],
      semesterTime: 0,
      semesterXP: 0,
      sessionStartTimes: [],
      totalBreakTime: 0,
    };

    this.timerData.currentSemester = resetSemester;

    await this.timerData!.save();

    return semesterRecap;
  }
}
