const { cyanBright, redBright, blueBright } = require("chalk");

let currentRank = 6; //User's current rank
let rpBeforeGain = 500; //User's RP before the addition
let gainedRP = 12000; //The amount of RP gained
let rpAfterGain = gainedRP + rpBeforeGain; //The user's RP after the gained has been added

let rankedLevels = 0; //The number of extra levels the user will get depending on how many times they rank up

//Function that will calculate the amount of RP required to rank up once, uses the before gain RP
function RPRequiredToLevelUp(rank, currentRP) {
  return rank * 800 + (rank - 1) * 400 + currentRP;
}
//Function that will calculate the amount of RP required to rank up depending on how many extra ranks are added
function RPForMultipleLevels(rank, currentRP, extraRanks) {
  const addedRanks = rank + extraRanks;
  return addedRanks * 800 + (addedRanks - 1) * 400 + currentRP;
}

let RPRequired = RPForMultipleLevels(currentRank, rpBeforeGain, rankedLevels);

if (rpAfterGain === RPRequired) {
  rankedLevels++;
  console.log(`RP is equal and no remainder`);
}

for (let i = 0; rpAfterGain > RPRequired; i++) {
  rankedLevels++;
  RPRequired = RPForMultipleLevels(currentRank, rpBeforeGain, rankedLevels);
  if (rpAfterGain < RPRequired) {
    rankedLevels--;
    console.log(`Stopped\nExtra lvls: ${rankedLevels}`);
    break;
  }
  console.log(
    `Extra Levels: ${rankedLevels} : Current Level: ${
      currentRank + rankedLevels
    } : XP for next: ${RPRequired}`
  );
}

console.log(rankedLevels);
