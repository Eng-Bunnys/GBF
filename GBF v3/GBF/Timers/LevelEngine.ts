/**
 *
 * @param {number} level The user's level + 1
 * @returns {number} The amount of XP the user is required to reach the next level
 * @example
 * //Returns 100
 * console.log(xpRequired(1))
 */
export function xpRequired(level: number): number {
  return level * 400 + (level - 1) * 200 - 300;
}

/**
 *
 * @param {number} level The user's level + 1
 * @returns {number} The amount of XP the user is required to reach the next level
 * @example
 * //Returns 300
 * console.log(xpRequired(1))
 */
export function rpRequired(level: number): number {
  return level * 800 + (level - 1) * 400 - 500;
}

/**
 * @param {number} XP [The required XP to reach the next level]
 * @description [For every 5 minutes spent, 180 XP is given, we use that information to calculate the number of hours]
 * @returns {Hours} [The hours required to gain enough XP to reach the next level]
 */

export function hoursRequired(XP: number): number {
  let minutesFunction: number = (5 * XP) / 180;
  return minutesFunction / 60;
}

/**
 * Calculate the amount of XP rewarded for the time elapsed
 *
 * @param {number} time - Time elapsed in minutes, where each 5-minute block awards 180 XP
 * @returns {number} - The amount of XP rewarded for the time elapsed, rounded down to nearest integer
 */
export function calculateXP(time: number): number {
  return Math.floor(time / 5) * 180;
}

/**
 * Check if the user has ranked up and calculate the number of level ups and remaining XP
 *
 * @param {number} currentRank - The user's current level
 * @param {number} currentRP - The user's XP before any additions
 * @param {number} addedRP - The added XP rewarded
 * @returns {Array<boolean | number>} - An array with the following elements:
 * @returns {Array<boolean | number>[0]} - A boolean indicating if the user has ranked up
 * @returns {Array<boolean | number>[1]} - The number of level ups
 * @returns {Array<boolean | number>[2]} - The remaining XP that was extra
 */
export function checkLevel(
  currentRank: number,
  currentRP: number,
  addedRP: number
): Array<boolean | number> {
  let addedLevels = 0;
  let hasRankedUp = false;

  let requiredRP = xpRequired(currentRank + addedLevels);

  let userRP = currentRP + addedRP;

  if (userRP > requiredRP) {
    hasRankedUp = true;
    addedLevels++;
  }

  let remainingRP = userRP - requiredRP;

  if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
    for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
      addedLevels++;
      if (currentRank + addedLevels >= 5000) {
        addedLevels--;
        break;
      }
      requiredRP = xpRequired(currentRank + addedLevels);
    }
  }

  if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;

  return [hasRankedUp, addedLevels, remainingRP];
}

/**
 * Check if the user has ranked up and calculate the number of level ups and remaining XP
 *
 * @param {number} currentRank - The user's current level
 * @param {number} currentRP - The user's XP before any additions
 * @param {number} addedRP - The added XP rewarded
 * @returns {Array<boolean | number>} - An array with the following elements:
 * @returns {Array<boolean>[0]} - A boolean indicating if the user has ranked up
 * @returns {Array<number>[1]} - The number of level ups
 * @returns {Array<number>[2]} - The remaining XP that was extra
 */
export function checkRank(
  currentRank: number,
  currentRP: number,
  addedRP: number
): Array<boolean | number> {
  let addedLevels = 0;
  let hasRankedUp = false;

  let requiredRP = rpRequired(currentRank + addedLevels);

  let userRP = currentRP + addedRP;

  if (userRP > requiredRP) {
    hasRankedUp = true;
    addedLevels++;
  }

  let remainingRP = userRP - requiredRP;

  if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
    for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
      addedLevels++;
      if (currentRank + addedLevels >= 5000) {
        addedLevels--;
        break;
      }
      requiredRP = rpRequired(currentRank + addedLevels);
    }
  }

  if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;

  return [hasRankedUp, addedLevels, remainingRP];
}

export function convertSeasonLevel(level: number): number {
  return level * 500 + Math.round(level / 5) * 5;
}

export function calculateTotalSeasonXP(SeasonLevel: number): number {
  let totalXP = 0;
  for (let level = 1; level <= SeasonLevel; level++) {
    totalXP += level * 400 + (level - 1) * 200 - 300;
  }
  return totalXP;
}

export function calculateTotalAccountRP(AccountRank: number): number {
  let totalXP = 0;
  for (let level = 1; level <= AccountRank; level++) {
    totalXP += level * 800 + (level - 1) * 400 - 500;
  }
  return totalXP;
}
