import { Snowflake } from "discord.js";
import { createAccount, getAccount } from "./SueLuz Engine";
import {
  GBFUserProfileModel,
  IUserProfileData
} from "../../schemas/User Schemas/User Profile Schema";

export default class EconomyUser {
  private readonly UserID?: Snowflake;
  constructor(userID?: Snowflake) {
    this.UserID = userID;
  }

  /**
   *
   * @param userID [The user's ID from either interaction.user.id or message.user.id]
   * @returns An array containing the user's data as in balance, wallet balance and total balance
   */
  public async getBalance(userID = this.UserID): Promise<number[]> {
    const TargetUser = await getAccount(userID);

    if (typeof TargetUser == "string") {
      await createAccount(userID);

      const UserData = (await GBFUserProfileModel.findOne({
        userID: userID
      })) as IUserProfileData;

      return [
        UserData.bank,
        UserData.cash,
        Number(Math.fround(UserData.bank + UserData.cash))
      ];
    } else
      return [
        TargetUser.bank,
        TargetUser.cash,
        Number(Math.fround(TargetUser.bank + TargetUser.cash))
      ];
  }
}
