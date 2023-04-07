let currentRank = 1;
let currentRP = 500;
let earnedRP = 300000;

function RPRequiredToLevelUp(rank, rp) {
  const fOfx = rank * 800 + (rank - 1) * 400;
  return fOfx + rp;
}

function percentageRemaing(currentRP, requiredRP) {
  return `${Math.round((currentRP / requiredRP) * 100)}%`;
}

function checkRank(currentRank, currentRP, addedRP) {
  let addedLevels = 0;
  let hasRankedUp = false;

  let requiredRP = RPRequiredToLevelUp(currentRank + addedLevels, currentRP);

  if (addedRP > requiredRP) {
    hasRankedUp = true;
    addedLevels++;
  }

  let remainingRP = addedRP - requiredRP;
  if (Math.abs(remainingRP) === remainingRP) {
    for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
      addedLevels++;
      requiredRP = RPRequiredToLevelUp(currentRank + addedLevels, currentRP);
    }
  }

  return [hasRankedUp, addedLevels, remainingRP];
}

console.log(checkRank(currentRank, currentRP, currentRP + earnedRP));
