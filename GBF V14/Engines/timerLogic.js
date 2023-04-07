/**
 * @param {*} level [User's current level + 1]
 * @returns {XP} [XP required to reach the next level]
 */
function xpRequired(level) {
  return level * 400 + (level - 1) * 200 - 300;
}

/**
 * @param {*} level [User's current level + 1]
 * @returns {XP} [XP required to reach the next level]
 */

function xpRequiredAccount(level) {
  return level * 800 + (level - 1) * 400 - 500;
}
/**
 * @param {*} XP [The required XP to reach the next level]
 * @description [For every 5 minutes spent, 180 XP is given, we use that information to calculate the number of hours]
 * @returns {Hours} [The hours required to gain enough XP to reach the next level]
 */

function hoursRequired(XP) {
  let minutesFunction = (5 * XP) / 180;
  return minutesFunction / 60;
}

/**
 * @param {*} streak [The user's current login streak + 1 day]
 * @returns [1, Default: 20 XP, 5 Coins]
 * @returns [Collection Day, Rewarded XP, Rewarded Coins]
 */

function loginReward(streak = 1) {
  // Getting the day number of the week based of the user's streak

  let day;
  if (streak % 7 == 0) day = 7;
  else day = streak % 7;

  // XP reward

  let xpReward = streak * 200;

  if (xpReward > 20000) xpReward = 20000;

  let coinsReward = streak * 5;

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
 *
 * @param {*} level [The user's new level]
 * @returns [Reward based off the user's level from a scale of 1-10 that resets every 10 levels]
 */


/**
 * @param {*} data [The user's data / Object containing the timer data]
 * @param {*} message [The initiation message fetched]
 * @param {*} originalUser [The owner of the message]
 * @param {*} interaction [Discord.JS interaction]
 * @returns [httpStatus response]
 */

function checkUser(data, message, originalUser, interaction) {
  let status;
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
 * @param {*} time - [Time in minutes, each 5 minutes is 180 XP]
 * @returns [Amount of XP rewarded for the time elapsed]
 */

function calculateXP(time) {
  return Math.floor(time / 5) * 180;
}

/**
 * @param {*} currentRank - The user's current level
 * @param {*} currentRP - The user's XP before any additions
 * @param {*} addedRP - currentRP + the XP rewarded
 * @returns - [Boolean if the user has ranked up [0], Number of level ups [1], Remaining XP that was extra [2]]
 */

function checkRank(currentRank, currentRP, addedRP) {
  let addedLevels = 0;
  let hasRankedUp = false;

  let requiredRP = xpRequired(currentRank + addedLevels, currentRP);

  if (addedRP > requiredRP) {
    hasRankedUp = true;
    addedLevels++;
  }

  let remainingRP = addedRP - requiredRP;
  if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
    for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
      addedLevels++;
      if (currentRank + addedLevels >= 5000) {
        addedLevels--;
        break;
      }
      requiredRP = xpRequired(currentRank + addedLevels, currentRP);
    }
  }
  if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;
  return [hasRankedUp, addedLevels, remainingRP];
}

/**
 * @param {*} currentRank - The user's current level
 * @param {*} currentRP - The user's XP before any additions
 * @param {*} addedRP - currentRP + the XP rewarded
 * @returns - [Boolean if the user has ranked up [0], Number of level ups [1], Remaining XP that was extra [2]]
 */

function checkRankAccount(currentRank, currentRP, addedRP) {
  let addedLevels = 0;
  let hasRankedUp = false;

  let requiredRP = xpRequiredAccount(currentRank + addedLevels, currentRP);

  if (addedRP > requiredRP) {
    hasRankedUp = true;
    addedLevels++;
  }

  let remainingRP = addedRP - requiredRP;
  if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
    for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
      addedLevels++;
      if (currentRank + addedLevels >= 5000) {
        addedLevels--;
        break;
      }
      requiredRP = xpRequiredAccount(currentRank + addedLevels, currentRP);
    }
  }
  if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;
  return [hasRankedUp, addedLevels, remainingRP];
}

module.exports = {
  xpRequired,
  xpRequiredAccount,
  hoursRequired,
  loginReward,
  checkUser,
  calculateXP,
  checkRank,
  checkRankAccount
};
