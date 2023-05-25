import { Interaction, Message } from "discord.js";

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
export function xpRequiredAccount(level: number): number {
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
 * Calculate the login reward for a user's login streak
 *
 * @param {number} streak - The user's current login streak (default: 1)
 * @returns {(Array<number | string>)} - An array representing the collection day, rewarded XP, and rewarded coins respectively
 * @returns {Array<number | string>[0]} - The collection day (1 to 7)
 * @returns {Array<number | string>[1]} - The rewarded XP (up to 20,000 XP)
 * @returns {Array<number | string>[2]} - The rewarded coins (up to 50 coins)
 */
export function loginReward(streak: number = 1): Array<number | string> {
  // Getting the day number of the week based of the user's streak
  let day: number;
  if (streak % 7 == 0) day = 7;
  else day = streak % 7;

  // XP reward
  let xpReward: number = streak * 200;
  if (xpReward > 20000) xpReward = 20000;

  let coinsReward: number = streak * 5;
  if (coinsReward > 50) coinsReward = 50;

  // These multipliers are after the checks since they bypass the limit
  if (day === 4) coinsReward /= 2;
  if (day === 6) xpReward *= 2;
  if (day === 7) coinsReward *= 2;

  if (day !== 7 && day !== 4) coinsReward = 0;
  if (day === 7 || day === 4) xpReward = 0;

  return [day, Math.floor(xpReward), Math.floor(coinsReward)];
}

/**
 * Calculate the reward based on the user's level
 * @param {number} level - The user's new level
 * @returns {Array<number>} - An array representing the reward based on the user's level from a scale of 1-10 that resets every 10 levels
 */

/**
 * Check if the user data is valid and authorized for a given interaction
 * @param {object} data - The user's data / Object containing the timer data
 * @param {Message} message - The initiation message fetched
 * @param {object} originalUser - The owner of the message
 * @param {Interaction} interaction - Discord.JS interaction
 * @returns {string} - An httpStatus response
 */
export function checkUser(
  data: object | any,
  message: Message,
  originalUser: object | any,
  interaction: Interaction
): string {
  let status: string;
  if (!data) return (status = "404");
  else if (data && !data.messageID) return (status = "403");
  if (data && !message) return (status = "404-1");
  if (data && !originalUser) return (status = "404-1");
  if (
    data &&
    message &&
    originalUser &&
    originalUser.userID !== interaction.user.id
  )
    return (status = "403-1");
  else return (status = "200");
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
export function checkRank(
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
export function checkRankAccount(
  currentRank: number,
  currentRP: number,
  addedRP: number
): Array<boolean | number> {
  let addedLevels = 0;
  let hasRankedUp = false;

  let requiredRP = xpRequiredAccount(currentRank + addedLevels);

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
      requiredRP = xpRequiredAccount(currentRank + addedLevels);
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
