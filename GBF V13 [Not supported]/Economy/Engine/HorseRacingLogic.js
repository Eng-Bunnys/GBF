//Constants like playerBet are variables in the code itself
let playersHorse = Math.round(Math.random() * 4);

if (playersHorse === 0) playersHorse = 1;

const maxBet = 250000;
const minBet = 10000;

let winningHorse = Math.round(Math.random() * 4);

if (winningHorse === 0) winningHorse = 1;

let playerBet = 25000;

const horses = {
  1: "Blue",
  2: "Red",
  3: " Green",
  4: "White"
};

function horseRace(chosenHorse, winningHorse, bet) {
  let winnerBoolean = false;

  if (chosenHorse == winningHorse) winnerBoolean = true;

  const secondHorseBet = Math.round(Math.random() * (maxBet - minBet) + minBet);
  const thirdHorseBet = Math.round(Math.random() * (maxBet - minBet) + minBet);
  const fourthHorseBet = Math.round(Math.random() * (maxBet - minBet) + minBet);

  const userWinnings = secondHorseBet + thirdHorseBet + fourthHorseBet;

  const wonRP = Math.round(bet * 1.25);

  return [
    winnerBoolean,
    userWinnings,
    wonRP,
    secondHorseBet,
    thirdHorseBet,
    fourthHorseBet
  ];
}

console.log(horseRace(playersHorse, winningHorse, playerBet));
