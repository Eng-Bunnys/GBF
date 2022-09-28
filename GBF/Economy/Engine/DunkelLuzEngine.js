const { MessageEmbed } = require("discord.js");

const colours = require("../GBFColor.json");
const emojis = require("../GBFEmojis.json");
const title = require("../gbfembedmessages.json");

function RPRequiredToLevelUp(rank, rp) {
  return rank * 800 + (rank - 1) * 400 + rp;
}

function RPForMultipleLevels(rank, currentRP, extraRanks) {
  const addedRanks = rank + extraRanks;
  return addedRanks * 800 + (addedRanks - 1) * 400 + currentRP;
}

function percentageCompleteTillNextRank(rank, rp) {
  const nextRankRp = RPRequiredToLevelUp(rank, rp);
  return ((rp * 100) / nextRankRp).toFixed(1);
}

function LevelUpReward(rank, extraLevels) {
  let rewardedCash = 0;
  if (extraLevels !== 0) {
    for (let i = 0; i < extraLevels; i++) {
      rewardedCash += (rank + i) * 5 * 100;
    }
  } else rewardedCash = rank * 5 * 100;
  return rewardedCash;
}

function checkRank(currentRank, rpBeforeGain, rpAfterGain) {
  let rankedLevels = 0;
  let hasRankedUp = false;

  if (currentRank >= 5000) return;

  let RPRequired = RPForMultipleLevels(currentRank, rpBeforeGain, rankedLevels);

  if (rpAfterGain === RPRequired) {
    rankedLevels++;
    hasRankedUp = true;
  }

  for (let i = 0; rpAfterGain > RPRequired; i++) {
    rankedLevels++;
    hasRankedUp = true;
    RPRequired = RPForMultipleLevels(currentRank, rpBeforeGain, rankedLevels);
    if (rpAfterGain < RPRequired) {
      rankedLevels--;
      break;
    }
  }
  return [hasRankedUp, rankedLevels];
}

function DunkelCoinsEarned(rank, extraRanks) {
  let rewardedCoins = 0;
  if (extraRanks !== 0) {
    for (let i = 0; i < extraRanks; i++) {
      let checkDivisiblity = (rank + i) % 10 === 0;
      if (checkDivisiblity) rewardedCoins += 20;
      else rewardedCoins += 0;
    }
  } else {
    let checkDivisiblity = rank % 10 === 0;
    if (checkDivisiblity) rewardedCoins += 20;
    else rewardedCoins += 0;
  }
  return rewardedCoins;
}

function DailyMoney(streak) {
  let RewardedMoney = Math.round(streak * 300);

  if (RewardedMoney >= 30000) RewardedMoney = 30000;
  return RewardedMoney;
}

function DailyRP(streak) {
  let RewardedRP = Math.round(streak * 100);

  if (RewardedRP >= 10000) RewardedRP = 10000;
  return RewardedRP;
}

function achievementCompletion(totalEarned) {
  const totalAchievements = 4;
  return ((totalEarned / totalAchievements) * 100).toFixed(0);
}

function guessReward(bet) {
  const CashAndRpReward = [Math.round(bet * 2), Math.round(bet * 0.75)];
  return CashAndRpReward;
}

function abbreviateNumber(number, maxPlaces, forcePlaces, forceLetter) {
  number = Number(number);
  forceLetter = forceLetter || false;
  if (forceLetter !== false) {
    return annotateAbbreviation(number, maxPlaces, forcePlaces, forceLetter);
  }
  let abbr;
  if (number >= 1e12) {
    abbr = "T";
  } else if (number >= 1e9) {
    abbr = "B";
  } else if (number >= 1e6) {
    abbr = "M";
  } else if (number >= 1e3) {
    abbr = "K";
  } else {
    abbr = "";
  }
  return annotateAbbreviation(number, maxPlaces, forcePlaces, abbr);
}

function annotateAbbreviation(number, maxPlaces, forcePlaces, abbr) {
  let rounded = 0;
  switch (abbr) {
    case "T":
      rounded = number / 1e12;
      break;
    case "B":
      rounded = number / 1e9;
      break;
    case "M":
      rounded = number / 1e6;
      break;
    case "K":
      rounded = number / 1e3;
      break;
    case "":
      rounded = number;
      break;
  }
  if (maxPlaces !== false) {
    let test = new RegExp("\\.\\d{" + (maxPlaces + 1) + ",}$");
    if (test.test("" + rounded)) {
      rounded = rounded.toFixed(maxPlaces);
    }
  }
  if (forcePlaces !== false) {
    rounded = Number(rounded).toFixed(forcePlaces);
  }
  return rounded + abbr;
}
const accountRequired = new MessageEmbed()
  .setTitle(`${emojis.ERROR} Not yet!`)
  .setColor(colours.ERRORRED)
  .setDescription(
    `A DunkelLuz account is required to use this feature, you can create one for free using </account login:1023695302332526653> or transfer an existing account to this Discord account using the same command.`
  )
  .setFooter({
    text: `This system is in place to help protect your progress in-case you lost your Discord account or moved to a new one`
  })
  .setTimestamp();

const incompleteTutorial = new MessageEmbed()
  .setTitle(`${emojis.ERROR} Not yet!`)
  .setColor(colours.ERRORRED)
  .setDescription(
    `You are required to complete the DunkelLuz tutorial before using it's feautres.\n\n\</tutorial:1023342243433697403>`
  )
  .setTimestamp();

const targetNoAccount = new MessageEmbed()
  .setTitle(`${emojis.ERROR} Not yet!`)
  .setColor(colours.ERRORRED)
  .setDescription(`The specified user does not have a DunkelLuz account`)
  .setTimestamp();

const targetNoTutorial = new MessageEmbed()
  .setTitle(`${emojis.ERROR} Not yet!`)
  .setColor(colours.ERRORRED)
  .setDescription(`The specified user has not completed the DunkelLuz tutorial`)
  .setTimestamp();

module.exports = {
  RPRequiredToLevelUp,
  LevelUpReward,
  checkRank,
  DunkelCoinsEarned,
  DailyMoney,
  DailyRP,
  achievementCompletion,
  guessReward,
  abbreviateNumber,
  percentageCompleteTillNextRank,
  accountRequired,
  incompleteTutorial,
  targetNoAccount,
  targetNoTutorial
};
