/**
 * Returns a random element from an array.
 * @template T
 * @param {T[]} Array - The input array.
 * @returns {T} A random element from the array.
 * @example
 * // returns a random number from the array [1, 2, 3, 4, 5]
 * GetRandomFromArray([1, 2, 3, 4, 5]);
 */
export function GetRandomFromArray<T>(Array: T[]): T {
  const RandomIndex = Math.floor(Math.random() * Array.length);
  return Array[RandomIndex];
}
