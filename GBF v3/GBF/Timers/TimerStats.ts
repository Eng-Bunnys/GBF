import { Emojis, msToTime } from "../../Handler";
import { ITimerData, Semester } from "../../Models/Timer/TimerTypes";
import { GBFUser } from "../../Models/User/UserTypes";
import { rpRequired, xpRequired } from "./LevelEngine";

export class TimerStats {
  public timerData: ITimerData;
  public userData: GBFUser;

  constructor(timerData: ITimerData, userData: GBFUser) {
    this.timerData = timerData;
    this.userData = userData;
  }

  /// Account Details

  public getTotalStudyTime(): number {
    return this.timerData.account.lifetimeTime > 0
      ? this.timerData.account.lifetimeTime * 1000
      : 0;
  }

  public getSemesterTime(): number {
    return this.timerData.currentSemester.semesterTime
      ? this.timerData.currentSemester.semesterTime * 1000
      : 0;
  }

  public getSessionCount(): number {
    return this.timerData.sessionData.length || 0;
  }

  public getAverageSessionTime(): number {
    return this.timerData.account.lifetimeTime > 0 && this.getSessionCount() > 0
      ? (this.timerData.account.lifetimeTime / this.getSessionCount()) * 1000
      : 0;
  }

  /// Record Details

  public getLongestSessionTime(): number {
    return this.timerData.account.longestSessionTime !== null
      ? this.timerData.account.longestSessionTime * 1000
      : 0;
  }

  public getLongestSemester(): Semester | null {
    return this.timerData.account.longestSemester
      ? this.timerData.account.longestSemester
      : null;
  }

  /// Semester Break Details

  public getBreakTime(): number {
    return this.timerData.currentSemester.totalBreakTime > 0
      ? this.timerData.currentSemester.totalBreakTime * 1000
      : 0;
  }

  public getBreakCount(): number {
    return this.timerData.currentSemester.breakCount || 0;
  }

  public getAverageBreakTime(): number {
    return this.timerData.currentSemester.totalBreakTime > 0 &&
      this.getBreakCount() > 0
      ? (this.timerData.currentSemester.totalBreakTime / this.getBreakCount()) *
          1000
      : 0;
  }

  public getAverageTimeBetweenBreaks() {
    return this.timerData.currentSemester.semesterTime > 0 &&
      this.getBreakCount() > 0
      ? (this.timerData.currentSemester.semesterTime /
          this.timerData.currentSemester.breakCount) *
          1000
      : 0;
  }

  /// Subject Details

  public getSubjectCount(): number {
    return this.timerData.currentSemester.semesterSubjects.length || 0;
  }

  public getMostStudiedSubject() {
    return this.timerData.currentSemester.semesterSubjects.length > 0
      ? this.timerData.currentSemester.semesterSubjects.reduce(
          (prev, current) =>
            prev.timesStudied > current.timesStudied ? prev : current
        ).subjectName
      : "No Data";
  }

  public getLeastStudiedSubject() {
    return this.timerData.currentSemester.semesterSubjects.length > 0
      ? this.timerData.currentSemester.semesterSubjects.reduce(
          (prev, current) =>
            prev.timesStudied < current.timesStudied ? prev : current
        ).subjectName
      : "No Data";
  }

  public getAverageStudyTimePerSubject(): number {
    return this.timerData.currentSemester.semesterSubjects.length > 0
      ? (this.timerData.currentSemester.semesterTime /
          this.timerData.currentSemester.semesterSubjects.length) *
          1000
      : 0;
  }

  /// Last Session Details

  public getLastSessionTopic() {
    return this.timerData.sessionData.length > 0
      ? this.timerData.sessionData[this.timerData.sessionData.length - 1]
          .sessionTopic
      : "No Data";
  }

  public getLastSessionTime(): number {
    return this.timerData.sessionData.length > 0
      ? this.timerData.sessionData[this.timerData.sessionData.length - 1]
          .sessionTime * 1000
      : 0;
  }

  public getLastSessionDateUNIX(): number | null {
    return this.timerData.sessionData.length > 0
      ? Math.round(
          this.timerData.sessionData[
            this.timerData.sessionData.length - 1
          ].lastSessionDate.getTime() / 1000
        )
      : null;
  }

  /// Average Session Details

  public getAverageStartTimeUNIX(): number | null {
    return this.timerData.currentSemester.sessionStartTimes.length > 0
      ? Math.round(
          this.timerData.currentSemester.sessionStartTimes.reduce(
            (prev, current) => prev + current
          ) /
            this.timerData.currentSemester.sessionStartTimes.length /
            1000
        )
      : null;
  }

  public getAverageTimePerWeek(): number {
    return this.timerData.currentSemester.sessionStartTimes.length > 0
      ? (this.timerData.currentSemester.semesterTime /
          this.timerData.currentSemester.sessionStartTimes.length) *
          1000
      : 0;
  }

  /// Level Details

  public getSemesterLevel(): number {
    return this.timerData.currentSemester.semesterLevel || 0;
  }

  public getSemesterXP(): number {
    return this.timerData.currentSemester.semesterXP || 0;
  }

  public getAccountLevel(): number {
    return this.userData.Rank || 0;
  }

  public getAccountRP(): number {
    return this.userData.RP || 0;
  }

  public percentageToNextRank(): number {
    return this.userData.Rank
      ? Math.round((this.userData.RP / rpRequired(this.userData.Rank)) * 100)
      : 0;
  }

  public percentageToNextLevel(): number {
    return this.timerData.currentSemester.semesterLevel
      ? Math.round(
          (this.timerData.currentSemester.semesterXP /
            xpRequired(this.timerData.currentSemester.semesterLevel)) *
            100
        )
      : 0;
  }

  public generateProgressBar(
    percentageComplete: number,
    totalSegments: number = 4
  ) {
    const clampedPercentage = Math.min(Math.max(percentageComplete, 0), 100);

    const filledSegments = Math.floor(
      (clampedPercentage / 100) * totalSegments
    );

    const progressSegments = Array(totalSegments).fill(
      Emojis.progressBarMiddleEmpty
    );

    for (let i = 0; i < filledSegments; i++) {
      if (i == 0) progressSegments[i] = Emojis.progressBarLeftFull;
      else if (i == filledSegments - 1)
        progressSegments[i] = Emojis.progressBarRightFull;
      else progressSegments[i] = Emojis.progressBarMiddleFull;
    }

    if (filledSegments === 0 && clampedPercentage > 0)
      progressSegments[0] = Emojis.progressBarLeftFull;

    return progressSegments.join("");
  }
}
