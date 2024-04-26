import { Document } from "mongoose";
import { ITimerData, TimerModel } from "../Models/User Schemas/Timer Schema";
import {
  IUserProfile,
  UserProfileModel,
} from "../Models/User Schemas/User Profile Schema";
import { Snowflake } from "discord.js";
import { msToTime } from "../Handler";

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
}
