import { Document } from "mongoose";
import { ITimerData, TimerModel } from "../../Models/User Schemas/Timer Schema";
import {
  IUserProfile,
  UserProfileModel,
} from "../../Models/User Schemas/User Profile Schema";
import { Snowflake } from "discord.js";
import { ChunkSum, msToTime } from "../../Handler";

/**
 * Calculates the average start time from an array of 24-hour times,
 * and optionally converts it to a UNIX timestamp
 *
 * @param Times - An array of numbers representing times in a 24-hour format.
 * @param UnixTimestamp - Whether to return the result as a UNIX timestamp (default is false).
 * @returns The average start time as a float in 24-hour format, or as a UNIX timestamp in seconds.
 */
function CalculateAverageStartTime(
  Times: number[],
  UnixTimestamp = false
): number | InsufficientDataT {
  if (Times.length === 0) return InSufficientData;

  // Convert times in 24-hour format to total minutes since midnight
  const ConvertToMinutes = (Time: number): number => {
    const Hours = Math.floor(Time);
    const FractionalPart = (Time - Hours) * 100;
    return Hours * 60 + Math.round(FractionalPart);
  };

  // Convert total minutes since midnight to 24-hour float
  const ConvertFromMinutes = (Minutes: number): number => {
    const Hours = Math.floor(Minutes / 60);
    const RemainingMinutes = Minutes % 60;
    return Hours + RemainingMinutes / 100;
  };

  // Calculate the average total minutes
  const TotalMinutes = Times.map(ConvertToMinutes);
  const AverageMinutes =
    TotalMinutes.reduce((sum, current) => sum + current, 0) / Times.length;

  // Convert the average to 24-hour float format
  const Average24Hour = ConvertFromMinutes(AverageMinutes);

  if (UnixTimestamp) {
    // Convert to UNIX timestamp for the current day
    const Today = new Date();
    Today.setHours(
      Math.floor(Average24Hour),
      Math.round((Average24Hour % 1) * 100),
      0,
      0
    );
    return Math.floor(Today.getTime() / 1000); // Return UNIX timestamp in seconds
  }

  // Return the average as a float representing 24-hour time
  return Average24Hour;
}

/* Type representing insufficient data */
type InsufficientDataT = "In-Sufficient Data.";

/* Constant representing insufficient data */
const InSufficientData: InsufficientDataT = "In-Sufficient Data.";

export class Timers {
  /* The user's Discord ID */
  public readonly UserID: Snowflake;

  /* Timer data for the user */
  public TimerData: (ITimerData & Document) | undefined;

  /* User profile data */
  public UserData: (IUserProfile & Document) | undefined;

  /**
   * Initializes the Timers instance and fetches user dat
   * @param {Snowflake} UserID - The Discord user ID
   */
  constructor(UserID: Snowflake) {
    this.UserID = UserID;

    (async () => {
      this.TimerData = await this.GetTimerData(this.UserID);
      this.UserData = await this.GetUserData(this.UserID);
    })();
  }

  /**
   * Retrieves timer data for the given user ID
   *
   * @param {Snowflake} UserID - The Discord user ID
   * @returns {Promise<(ITimerData & Document) | undefined>} Timer data for the user or undefined if not found
   */
  private async GetTimerData(
    UserID: Snowflake
  ): Promise<(ITimerData & Document) | undefined> {
    return await TimerModel.findOne({ userID: UserID });
  }

  /**
   * Retrieves user profile data for the given user ID
   *
   * @param {Snowflake} UserID - The Discord user ID
   * @returns {Promise<(IUserProfile & Document) | undefined>} User profile data for the user or undefined if not found
   */
  private async GetUserData(
    UserID: Snowflake
  ): Promise<(IUserProfile & Document) | undefined> {
    return await UserProfileModel.findOne({ userID: UserID });
  }

  /**
   * Summarizes total time spent in sessions and related information
   *
   * @contains Total time spent in sessions [Lifetime]
   * @contains Total time spent in sessions [Season]
   * @contains Average session time [Season]
   * @contains Total number of sessions [Season]
   * @returns {string} Formatted details about the user's timer account
   */
  public TotalTimeQuadrant(): string {
    let AccountDetails = `• Total Time: ${
      this.TimerData?.TotalTime > 0
        ? msToTime(this.TimerData.TotalTime * 1000)
        : InSufficientData
    } [${Math.round(this.TimerData?.TimeSpent / 3600) || 0}]`;

    AccountDetails += `\n• Total Season Time: ${
      this.TimerData?.TimeSpent > 0
        ? msToTime(this.TimerData.TimeSpent * 1000)
        : InSufficientData
    }`;

    const AverageSessionTime =
      this.TimerData?.TimeSpent > 0 && this.TimerData?.NumberOfSessions > 0
        ? this.TimerData.TimeSpent / this.TimerData.NumberOfSessions
        : InSufficientData;

    AccountDetails += `\n• Average Session Time: ${AverageSessionTime}`;
    AccountDetails += `\n• Total Number of Sessions: ${
      this.TimerData?.NumberOfSessions || 0
    }`;

    return AccountDetails;
  }

  /**
   * Summarizes the user's break times and related information
   *
   * @contains Total break time
   * @contains Average break time
   * @contains Number of breaks
   * @contains Average time between breaks
   * @returns {string} Formatted details about the user's break times
   */
  public BreakTimeQuadrant(): string {
    let BreakTimeDetails = `• Total Break Time: ${
      this.TimerData?.TimePaused > 0
        ? msToTime(this.TimerData.TimePaused * 1000)
        : InSufficientData
    }`;

    const AverageBreakTime =
      this.TimerData?.TimePaused > 0 && this.TimerData?.TotalBreaks > 0
        ? this.TimerData.TimePaused / this.TimerData.TotalBreaks
        : InSufficientData;

    BreakTimeDetails += `\n• Average Break Time: ${AverageBreakTime}`;

    BreakTimeDetails += `\n• Number of Breaks: ${
      this.TimerData?.TotalBreaks || 0
    }`;

    const TotalTimeHours = Math.round(this.TimerData?.TotalTime / 3600);

    let AverageTimeBetweenBreaks =
      TotalTimeHours > 0 && this.TimerData?.TotalBreaks > 0
        ? msToTime((TotalTimeHours / this.TimerData.TotalBreaks) * 1000 * 3600)
        : InSufficientData;

    BreakTimeDetails += `\n• Average Time Between Breaks: ${AverageTimeBetweenBreaks}`;

    return BreakTimeDetails;
  }

  /**
   * Summarizes information about the longest session and season
   *
   * @contains Longest season time
   * @contains Longest session time
   * @returns {string} Formatted details about the longest session and season
   */
  public LongestQuadrant(): string {
    let LongestDetails = `• Longest Season Time: ${
      this.TimerData?.LongestSeason > 0
        ? msToTime(this.TimerData.LongestSeason * 1000)
        : InSufficientData
    } [${Math.round((this.TimerData?.LongestSeason || 0) / 3600)} Hours]`;

    if (this.TimerData?.SeasonName) {
      LongestDetails += `\n• Longest Session Time: ${
        this.TimerData?.LongestSession > 0
          ? msToTime(this.TimerData.LongestSession * 1000)
          : InSufficientData
      }`;
    }

    return LongestDetails;
  }

  /**
   * Provides details about the previous session
   *
   * @contains Session duration
   * @contains Session date
   * @contains Difference from the average session time
   * @returns {string | undefined} Formatted details about the previous session, or undefined if season data is not available
   */
  public PreviousSessionQuadrant(): string | undefined {
    if (!this.TimerData?.SeasonName) return undefined;

    let PreviousSessionDetails = `• Session Duration: ${
      this.TimerData?.LastSessionTime > 0
        ? msToTime(this.TimerData.LastSessionTime * 1000)
        : InSufficientData
    }\n• ${
      this.TimerData?.LastSessionDate
        ? Math.floor(this.TimerData.LastSessionDate.getTime() / 1000)
        : InSufficientData
    }`;

    const TotalTime = this.TimerData?.TimeSpent
      ? this.TimerData?.NumberOfSessions
        ? this.TimerData.TimeSpent / this.TimerData.NumberOfSessions
        : InSufficientData
      : InSufficientData;

    let DifferenceFromAverage: number | InsufficientDataT;

    if (typeof TotalTime === "number") {
      DifferenceFromAverage = TotalTime - (this.TimerData.LastSessionTime || 0);
    } else {
      DifferenceFromAverage = InSufficientData;
    }

    PreviousSessionDetails += `• Difference From Average: ${
      typeof DifferenceFromAverage === "number"
        ? msToTime(DifferenceFromAverage * 1000)
        : InSufficientData
    }`;

    return PreviousSessionDetails;
  }

  /**
   * Provides details about the user's weekly stats
   *
   * @contains Average Start Time
   * @contains Average time per week
   * @contains Number of 5 day weeks
   * @returns {string | undefined} Formatted details about the previous session, or undefined if season data is not available
   */
  public StartTimeQuadrant() {
    if (!this.TimerData.StartTime.length) return undefined;

    const AverageStartTime = CalculateAverageStartTime(
      this.TimerData.StartTime,
      true
    );

    const WeeklyAverages = ChunkSum(this.TimerData.SessionLengths, 5);

    const WeeklySum = WeeklyAverages.reduce((sum, current) => sum + current);

    const AverageTimePerWeek =
      WeeklyAverages.length && WeeklyAverages.length < 1
        ? msToTime(WeeklySum * 1000) + `[${WeeklySum / 3600} Hours]`
        : InSufficientData;

    return `• Average Start Time: <t:${AverageStartTime}:t>
    \n• Average Session Time Per Week: ${AverageTimePerWeek}
    \n• Number of 5 day weeks: ${WeeklyAverages.length}`;
  }
}
