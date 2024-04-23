import { Document } from "mongoose";
import { ITimerData, TimerModel } from "../Models/User Schemas/Timer Schema";
import {
  IUserProfile,
  UserProfileModel,
} from "../Models/User Schemas/User Profile Schema";
import { Snowflake } from "discord.js";
import { msToTime } from "../Handler";

const InSufficientData = "In-Sufficient Data.";

export class Timers {
  public readonly UserID: Snowflake;
  public TimerData: (ITimerData & Document<any, any, ITimerData>) | undefined;
  public UserData:
    | (IUserProfile & Document<any, any, IUserProfile>)
    | undefined;
  constructor(UserID: Snowflake) {
    this.UserID = UserID;

    async () => {
      this.TimerData = await this.GetTimerData(this.UserID);
      this.UserData = await this.GetUserData(this.UserID);
    };
  }

  private async GetTimerData(UserID: Snowflake) {
    const TimerData: (ITimerData & Document<any, any, ITimerData>) | undefined =
      await TimerModel.findOne({
        userID: UserID,
      });

    return TimerData;
  }

  private async GetUserData(UserID: Snowflake) {
    const UserData:
      | (IUserProfile & Document<any, any, IUserProfile>)
      | undefined = await UserProfileModel.findOne({
      userID: UserID,
    });

    return UserData;
  }

  /**
   * @contains Total Time the user has spent in sessions [Lifetime]
   * @contains Total time the use has spent in sessions [Season]
   * @contains Average Session Time [Season]
   * @contains The total number of sessions [Season]
   * @returns {string} A string that contains all of the details about the user's timer account
   */
  public TotalTimeQuadrant(): string {
    let AccountDetails = `• Total Time: ${
      this.TimerData.TotalTime > 0
        ? msToTime(this.TimerData.TotalTime * 1000)
        : InSufficientData
    } [${Math.round(this.TimerData.TimeSpent / 3600) || 0}]`;

    AccountDetails += `\n• Total Season Time: ${
      this.TimerData.TimeSpent > 0
        ? msToTime(this.TimerData.TimeSpent * 1000)
        : InSufficientData
    }`;

    const AverageSessionTime =
      this.TimerData.TimeSpent > 0 && this.TimerData.NumberOfSessions > 0
        ? this.TimerData.TimeSpent / this.TimerData.NumberOfSessions
        : InSufficientData;

    AccountDetails += `\n• Average Session Time: ${AverageSessionTime}`;
    AccountDetails += `\n• Total Number of Sessions: ${this.TimerData.NumberOfSessions}`;

    return AccountDetails;
  }

  public BreakTimeQuadrant() {
    let BreakTimeDetails = `• Total Break Time: ${
      this.TimerData.TimePaused > 0
        ? msToTime(this.TimerData.TimePaused * 1000)
        : InSufficientData
    }`;

    const AverageBreakTime =
      this.TimerData.TimePaused > 0 && this.TimerData.TotalBreaks > 0
        ? this.TimerData.TimePaused / this.TimerData.TotalBreaks
        : InSufficientData;

    BreakTimeDetails += `• Average Break Time: ${AverageBreakTime}`;

    BreakTimeDetails += `• Number of Breaks: ${this.TimerData.TotalBreaks}`;
  }
}
