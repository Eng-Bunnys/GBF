type LevelType = "Season" | "Account";

export class SueLuzEngine {
  /**
   * Calculates the XP required to reach a given level, with an optional bonus modifier.
   *
   * @param {number} CurrentLevel - The current level.
   * @param {number} [BonusModifier=1] - A multiplier for XP requirements (default is 1).
   * @returns {number} The total XP required to reach the specified level, adjusted by the bonus modifier.
   */
  static XPRequired(CurrentLevel: number, BonusModifier: number = 1): number {
    return (
      (100 + (CurrentLevel - 1) * 150 + Math.pow(CurrentLevel - 1, 2) * 50) *
      BonusModifier
    );
  }

  /**
   * Calculates the RP (Ranking Points) required to reach a given rank with an optional bonus modifier.
   *
   * @param {number} CurrentRank - The current rank.
   * @param {number} [BonusModifier=1] - A multiplier to adjust RP requirements (default is 1).
   * @returns {number} The total RP required to reach the specified rank, modified by the bonus multiplier.
   */
  static RPRequired(CurrentRank: number, BonusModifier: number = 1): number {
    const BaseRP = 200;

    const LinearRP = (CurrentRank - 1) * 300;

    const QuadraticRP = Math.pow(CurrentRank - 1, 2) * 100;

    return (BaseRP + LinearRP + QuadraticRP) * BonusModifier;
  }

  static TimeToLevelUp(
    CurrentLevel: number,
    CurrentXP: number,
    Type: LevelType
  ) {
    let RemainingXP: number;
    if (Type === "Account")
      RemainingXP = SueLuzEngine.RPRequired(CurrentLevel) - CurrentXP;
    else RemainingXP = SueLuzEngine.XPRequired(CurrentLevel) - CurrentXP;

    return (5 * RemainingXP) / 300;
  }
}
