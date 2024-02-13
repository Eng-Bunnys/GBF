import { msToTime } from "gbfcommands";
import { ITimerData, TimerModel } from "../Models/User Schemas/Timer Schema";
import {
  IUserProfile,
  UserProfileModel,
} from "../Models/User Schemas/User Profile Schema";
import { Snowflake } from "discord.js";
import { Document } from "mongoose";
export class TimerStats {
  public readonly UserID: Snowflake;
  private TimerData: ITimerData & Document<any, any, ITimerData>;
  private UserData: IUserProfile & Document<any, any, IUserProfile>;
  constructor(UserID: Snowflake) {
    this.UserID = UserID;
  }

  async CheckData(): Promise<boolean> {
    const TimerData = await TimerModel.findOne({
      userID: this.UserID,
    });

    const UserData = await UserProfileModel.findOne({
      userID: this.UserID,
    });

    if (TimerData) this.TimerData = TimerData;
    if (UserData) this.UserData = UserData;

    if (TimerData && UserData) return true;
    else return false;
  }

  GetMessage(): string {
    if (!this.CheckData())
      return `The provided user does not have an active season / a timer account.`;

    let TimerStats = "";

    const InSufficientData = "In-Sufficient Data.";

    TimerStats += `• Total Time: ${
      this.TimerData.TotalTime > 0
        ? msToTime(this.TimerData.TotalTime * 1000)
        : InSufficientData
    }`;
    TimerStats += `\n• Total Season Time: ${
      this.TimerData.TimeSpent > 0
        ? msToTime(this.TimerData.TimeSpent * 1000)
        : InSufficientData
    }`;
    TimerStats += `\n• Average Season Time: ${
      this.TimerData.TimeSpent > 0 && this.TimerData.NumberOfSessions > 0
        ? msToTime(
            (this.TimerData.TimeSpent / this.TimerData.NumberOfSessions) * 1000
          )
        : InSufficientData
    }`;
    TimerStats += "\n\n";
    TimerStats += `• Total Break Time: ${
      this.TimerData.TimePaused > 0
        ? msToTime(this.TimerData.TimePaused * 1000)
        : InSufficientData
    }`;
    TimerStats += `• Average Break Time: ${
      this.TimerData.TimePaused > 0 && this.TimerData.TotalBreaks > 0
        ? msToTime(
            (this.TimerData.TimePaused / this.TimerData.TotalBreaks) * 1000
          )
        : InSufficientData
    }`;

    /**
     * @unit Seconds
     */
    let AverageTimeBetweenBreaks: string;
    if (
      Math.round(this.TimerData.TimeSpent) > 0 &&
      this.TimerData.TotalBreaks > 0
    )
      AverageTimeBetweenBreaks = msToTime(
        Math.abs(
          Math.round(this.TimerData.TimeSpent) / this.TimerData.TotalBreaks
        ) * 1000
      );
    else AverageTimeBetweenBreaks = InSufficientData;

    TimerStats += `• Average Time Between Breaks: ${AverageTimeBetweenBreaks}`;

    return TimerStats;
  }
}
