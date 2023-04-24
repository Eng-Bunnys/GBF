/**
 * @param array [Numbers array that contains the data you want to split]
 * @param size [The maximum number of elements in each array]
 * @returns [[...], [...]]
 */
export function chunkAverage(array: number[], size: number): number[] {
  let renderedChunk: number[];
  let chunkSum = 0;

  const chunkArray = [...array];
  const mainChunk: number[][] = [];
  const averageChunks: number[] = [];

  const backupChunks: number[][] = [];

  const splitIndex = !Number.isNaN(size) ? size : 7;

  while (chunkArray.length > 0) {
    renderedChunk = chunkArray.splice(0, splitIndex);

    if (renderedChunk.length === splitIndex) mainChunk.push(renderedChunk);
    else backupChunks.push(renderedChunk);
  }

  for (let j = 0; j < mainChunk.length || j < backupChunks.length; j++) {
    if (mainChunk.length) {
      chunkSum = mainChunk[j].reduce((partialSum, a) => partialSum + a, 0);
      averageChunks.push(chunkSum);
    } else {
      chunkSum = backupChunks[j].reduce((partialSum, a) => partialSum + a, 0);
      averageChunks.push(chunkSum);
    }
  }
  return averageChunks;
}
