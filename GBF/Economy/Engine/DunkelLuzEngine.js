const { MessageEmbed } = require("discord.js");

const colours = require("../GBFColor.json");
const emojis = require("../GBFEmojis.json");
const title = require("../gbfembedmessages.json");

function RPRequiredToLevelUp(rank) {
  return rank * 800 + (rank - 1) * 400;
}

function LevelUpReward(rank) {
  return rank * 5 * 100;
}

function checkRank(rank, rp) {
  const requiredRp = RPRequiredToLevelUp(rank);
  let hasLeveledUp = false;

  if (rank >= 5000) return;

  if (rp >= requiredRp) hasLeveledUp = true;
  return hasLeveledUp;
}

function DunkelCoinsEarned(rank) {
  const rankChecker = rank % 10 === 0;
  if (rankChecker) return 0.5 * rank + 1;
  else return 0;
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

const accountRequired = new MessageEmbed()
  .setTitle(`${emojis.ERROR} Not yet!`)
  .setColor(colours.ERRORRED)
  .setDescription(
    `A DunkelLuz account is required to use this feature, you can create one for free using \`/account login\` or transfer an existing account to this Discord account using the same command.`
  )
  .setFooter({
    text: `This system is in place to help protect your progress in-case you lost your Discord account or moved to a new one`
  })
  .setTimestamp();

const incompleteTutorial = new MessageEmbed()
  .setTitle(`${emojis.ERROR} Not yet!`)
  .setColor(colours.ERRORRED)
  .setDescription(
    `You are required to complete the DunkelLuz tutorial before using it's feautres.\n\n\`/tutorial\``
  )
  .setTimestamp();

module.exports = {
  RPRequiredToLevelUp,
  LevelUpReward,
  checkRank,
  DunkelCoinsEarned,
  DailyMoney,
  DailyRP,
  accountRequired,
  incompleteTutorial
};
