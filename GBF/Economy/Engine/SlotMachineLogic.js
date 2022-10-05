const userBet = 500;

const firstSlot = Math.round(Math.random() * 6);
const secondSlot = Math.round(Math.random() * 6);
const thirdSlot = Math.round(Math.random() * 6);

const slotItems = {
  1: "Slot Item One",
  2: "Slot Item Two",
  3: "Slot Item Three",
  4: "Slot Item Four",
  5: "Slot Item Five",
  6: "Slot Item Six"
};

function slotLogic(userBet, firstSlot, secondSlot, thirdSlot) {
  let userWinngs = 0;
  let rewardMulti = 0;

  console.log(
    `First: ${firstSlot}\nSecond: ${secondSlot}\nThird: ${thirdSlot}`
  );

  if (
    (firstSlot === secondSlot && firstSlot !== thirdSlot) ||
    (firstSlot === thirdSlot && firstSlot !== secondSlot)
  ) {
    rewardMulti = 2;
  }

  if (firstSlot === secondSlot && firstSlot === thirdSlot) {
    rewardMulti = 3;
  }

  userWinngs += userBet * rewardMulti;

  return [userWinngs, rewardMulti];
}

console.log(slotLogic(userBet, firstSlot, secondSlot, thirdSlot));
