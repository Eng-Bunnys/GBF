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

module.exports = {
  RPRequiredToLevelUp,
  LevelUpReward,
  checkRank,
  DunkelCoinsEarned
};
