function randomArray(length, max) {
  return [...new Array(length)].map(() => Math.round(Math.random() * max));
}

const sessionLengths = [
  17289, 12549, 9567, 13038, 16843, 10372, 28649, 24615, 15800.163,
  15190.889000000001, 21174.558, 15183.467, 24595.801, 74427.225,
  8914.152999999998, 7675.2660000000005, 16971.264, 35108.876, 14429.064,
  11896.083, 18158.615, 17283.023, 9876.223, 23420.531, 18883.690000000002,
  12874.771999999999
];

//const testArray = randomArray(250, 100);

function chunkAverage(chunkArray, size) {
  let renderedChunk;
  let chunkAverage = 0;
  let chunkSum = 0;

  const mainChunk = [];
  const averageChunks = [];

  const backupChunks = [];

  const splitIndex = !Number.isNaN(size) ? size : 7;

  while (chunkArray.length > 0) {
    renderedChunk = chunkArray.splice(0, splitIndex);

    if (renderedChunk.length === splitIndex) mainChunk.push(renderedChunk);
    else backupChunks.push(renderedChunk);
  }

  for (let j = 0; j < mainChunk.length || j < backupChunks.length; j++) {
    if (mainChunk.length) {
      chunkSum = mainChunk[j].reduce((partialSum, a) => partialSum + a, 0);
      // chunkAverage = chunkSum / mainChunk[j].length;
      averageChunks.push(chunkSum);
    } else {
      chunkSum = backupChunks[j].reduce((partialSum, a) => partialSum + a, 0);
      // chunkAverage = chunkSum / backupChunks[j].length;
      averageChunks.push(chunkSum);
    }
  }

  return averageChunks;
}

function toHours(seconds) {
  return seconds / 3600;
}

function averagePerDay(hours, restDays) {
  return hours / (7 - restDays);
}

function averageTotal(data) {
  let sum = 0;
  for (let k = 0; k < data.length; k++) {
    sum += data[k];
  }
  return sum / data.length;
}

const averageTimes = chunkAverage(sessionLengths, 7);

let currentIterationData;

for (let j = 0; j < averageTimes.length; j++) {
  currentIterationData = toHours(averageTimes[j].toFixed(5));
  console.log(
    `${averagePerDay(currentIterationData, 1).toFixed(2)} hours a day`
  );
}

console.log(
  `Average time per week: ${toHours(averageTotal(averageTimes)).toFixed(2)}`
);
