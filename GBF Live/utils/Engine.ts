import {
  BaseMessageOptions,
  CommandInteraction,
  DMChannel,
  Guild,
  GuildChannel,
  Interaction,
  Message,
  PermissionResolvable,
  Snowflake,
  TextBasedChannel,
  TextChannel
} from "discord.js";

import fs from "fs";
import path from "path";

import { PermissionFlagsBits, ChannelType, GuildMember } from "discord.js";

/**
 * Generates a random integer between the given minimum and maximum values (inclusive).
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random integer between min and max (inclusive).
 */
export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Delay the execution of the next instruction by a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to delay the execution.
 * @returns A Promise that resolves after the specified delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**

Converts a number of milliseconds into a string representation of time with
units of varying granularity.
 * @param {number} time - The time in milliseconds.
 * @param {object} [options] - Optional configuration options.
 * @param {string} [options.format='long'] - The format of the output string ('short' or 'long').
 * @param {boolean} [options.spaces=false] - Whether to include spaces in the output string.
 * @param {string} [options.joinString=' '] - The string to use for joining time units.
 * @param {number} [options.unitRounding=100] - The maximum number of time units to include in the output string.
 * @returns {string|undefined} The human-readable duration string, or undefined if the time is not a number or is negative.
@example
// Returns "1 hour 30 minutes"
msToTime(5400000);
@example
// Returns "2d 3h 45m"
msToTime(189000000, { format: 'short', spaces: true, joinString: ' ', unitRounding: 3 });
*/

interface Options {
  format?: "long" | "short";
  spaces?: boolean;
  joinString?: string;
  unitRounding?: number;
}

export function msToTime(
  time: number,
  options: Options = {}
): string | undefined {
  const defaultOptions: Options = {
    format: "long",
    spaces: false,
    joinString: " ",
    unitRounding: 100
  };

  options = Object.assign({}, defaultOptions, options);

  let timeStr = "";
  let nr = 0;

  if (typeof time !== "number" || time < 0) {
    return undefined;
  }

  for (let i = Object.keys(timeUnitValues).length - 1; i >= 0; i--) {
    let key = Object.keys(timeUnitValues)[i];
    if (key === "a") continue;

    let ctime = time / timeUnitValues[key];
    if (ctime >= 1) {
      if ((options.unitRounding || 100) < ++nr) break;

      ctime = Math.floor(ctime);
      timeStr += `${ctime} ${fullTimeUnitNames[key][options.format]}${
        ctime !== 1 && options.format !== "short" ? "s" : ""
      }${options.spaces ? " " : options.joinString}`;
      time -= ctime * timeUnitValues[key];
    }
  }

  timeStr = timeStr.trim();
  if (timeStr === "") return undefined;
  return timeStr;
}

/**
 * Returns a string representation of a duration in milliseconds in the format "X Days", "X Hours", "X Minutes", or "X Seconds".
 * @param {number} ms - The duration in milliseconds.
 * @param {number} round - Choose which decimal place to round the time to
 * @returns {string} A string representation of the duration in the format "X Days", "X Hours", "X Minutes", or "X Seconds".
 *
 * @example
 * const duration = 123456789;
 * const formattedDuration = basicMsToTime(duration, 1);
 * console.log(formattedDuration); // Output: "1.5 Days"
 */

export function basicMsToTime(ms: number, round = 1): string {
  const seconds = (ms / 1000).toFixed(round);
  const minutes = (ms / (1000 * 60)).toFixed(round);
  const hours = (ms / (1000 * 60 * 60)).toFixed(round);
  const days = (ms / (1000 * 60 * 60 * 24)).toFixed(round);

  if (Number(seconds) < 60) {
    return `${seconds} Seconds`;
  } else if (Number(minutes) < 60) {
    return `${minutes} Minutes`;
  } else if (Number(hours) < 24) {
    return `${hours} Hours`;
  } else {
    return `${days} Days`;
  }
}

/**

A function that takes a text string and a number and returns a shortened version of the text string.
If the text string is longer than the specified number of characters, it will be truncated and
an multiple of periods will be appended to the end.
@param {string} [text=''] - The text string to be shortened. Default value is an empty string.
@param {number} number - The maximum number of characters that the shortened text string should have.
Must be a positive integer.
@throws {TypeError} If the "text" parameter is not a string or the "number" parameter is not a positive integer.
@returns {string} The shortened version of the text string.
@example
// returns "Lorem ipsum..."
resume("Lorem ipsum dolor sit amet", 11); 
@example
// returns "Hello"
resume("Hello", 10);
*/

export function resume(text = "", number: number) {
  if (typeof text !== "string") {
    return "The text parameter must be a string.";
  }

  if (number < 1) {
    return "The number parameter must be a positive integer.";
  }

  const str = text.length > number ? `${text.substring(0, number)}...` : text;
  return str;
}

/**
 * Splits a message into smaller chunks to fit within a specific code length, with an optional separator.
 *
 * @param {string|string[]} message - The message to split. Can be a string or an array of strings.
 * @param {number} codeLength - The maximum length of each chunk.
 * @param {string} [separator='\n'] - The separator used to split the message. Defaults to a new line.
 *
 * @throws {Error} If the code length is not a positive integer.
 *
 * @returns {string[]} An array of strings containing the smaller chunks of the message.
 *
 * @example
 * // Split a message into 2000-character chunks
 * const chunks = MessageSplit("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tempor quis quam ac varius. Mauris rutrum in ex in lobortis.", 2000);
 *
 * @example
 * // Split an array of messages into 500-character chunks, using a semicolon as a separator
 * const messages = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit;", "Vestibulum tempor quis quam ac varius;", "Mauris rutrum in ex in lobortis."];
 * const chunks = MessageSplit(messages, 500, ";");
 */

export function MessageSplit(
  message: string | string[],
  codeLength: number,
  separator: string = "\n"
): string[] {
  if (!message) return [];

  const arrayNeeded: string[] = [];

  if (Array.isArray(message)) {
    message = message.join(separator);
  }

  if (message.length > codeLength) {
    for (const substring of message.match(
      new RegExp(`(.|\\n){1,${codeLength}}`, "g")
    ) || []) {
      const position = substring.lastIndexOf(separator);
      arrayNeeded.push(substring.substring(0, position));
      message = substring.substring(position + separator.length);
    }
  }

  if (message.length > 0) {
    arrayNeeded.push(message);
  }

  return arrayNeeded;
}

/**

Returns a string indicating the missing permissions of a target member, compared to the required permissions.
@param {GuildMember} targetMember - The target member to check the permissions of.
@param {PermissionResolvable | PermissionResolvable[]} requiredPermissions - The required permissions to check against.
@returns {string} - A string indicating the missing permissions, formatted with backticks for each missing permission.
If there is more than one missing permission, it will include "and n more" at the end of the list, where n is the number of additional missing permissions.
@throws {TypeError} - If the targetMember parameter is not a GuildMember or if the requiredPermissions parameter is not a PermissionResolvable.
@throws {RangeError} - If the requiredPermissions parameter is an empty array.
@example
// Returns "Manage Roles and Ban Members"
const targetMember = interaction.guild.members.cache.get('365647018393206785'); // Ace ID
const requiredPermissions = ['MANAGE_ROLES', 'BAN_MEMBERS'];
const missingPerms = missingPermissions(targetMember, requiredPermissions);
console.log(missingPerms);
*/

export function missingPermissions(targetMember, requiredPermissions) {
  if (!targetMember || !(targetMember instanceof GuildMember))
    return "Specificed user is not a GuildMember";

  const missingPerms = targetMember.permissions
    .missing(requiredPermissions)
    .map(
      (str) =>
        `\`${str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``
    );

  return missingPerms;
}

export function removeEmojis(string) {
  const emojiRegex =
    /(?:[\u2700-\u27bf]|\ud83c[\udde6-\uddff]{2}|[\ud800-\udbff][\udc00-\udfff]|\u0023-\u0039\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

  return string.replace(emojiRegex, "");
}

/**

Checks if a given string contains at least one numeric character
@param {string} str - The string to check for numeric characters
@returns {boolean} - true if the string contains at least one numeric character, false otherwise
@example
const hasNum = hasNumber('abc123'); // returns true
const noNum = hasNumber('hello world'); // returns false
*/

export function hasNumber(str) {
  return /\d/.test(str);
}

/**
 * Shuffles an array using the Fisher-Yates shuffle algorithm.
 *
 * @param {Array} array - The array to shuffle.
 * @returns {Array} The shuffled array.
 *
 * @example
 * const array = [1, 2, 3, 4, 5];
 * const shuffledArray = Arraytoshuffle(array);
 * console.log(`Shuffled numbers: ${shuffledArray.join(', ')}`) // List of Numbers
 * @example
 * 		const people = [
 *		{ name: 'Alice', age: 25 },
 *		{ name: 'Bob', age: 30 },
 *		{ name: 'Charlie', age: 35 },
 *		{ name: 'Dave', age: 40 },
 *		{ name: 'Eve', age: 45 },
 *		];
 *		 const shuffledPeople = client.utils.Arraytoshuffle(people);
 *		 console.log(`Shuffled people: ${shuffledPeople.map(p => p.name).join(', ')}`); // Random List of People
 */

export function Arraytoshuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function rolePermissions(targetRole) {
  const rolePerms = targetRole.permissions.toArray().map(
    (str) =>
      `${str
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b(\w)/g, (char) => char.toUpperCase())}`
  );

  return rolePerms.length > 1
    ? `${rolePerms.slice(0, -1).join(", ")} ${rolePerms.slice(-1)[0]}`
    : rolePerms[0];
}

export function KeyPerms(role: GuildMember) {
  let KeyPermissions = [];
  if (role.permissions.has(PermissionFlagsBits.Administrator))
    return ["Administrator", 1];
  else {
    if (role.permissions.has(PermissionFlagsBits.ManageGuild))
      KeyPermissions.push(`Manage Server`);
    if (role.permissions.has(PermissionFlagsBits.ManageRoles))
      KeyPermissions.push(`Manage Roles`);
    if (role.permissions.has(PermissionFlagsBits.ManageChannels))
      KeyPermissions.push(`Manage Channels`);
    if (role.permissions.has(PermissionFlagsBits.KickMembers))
      KeyPermissions.push(`Kick Members`);
    if (role.permissions.has(PermissionFlagsBits.BanMembers))
      KeyPermissions.push(`Ban Members`);
    if (role.permissions.has(PermissionFlagsBits.ManageNicknames))
      KeyPermissions.push(`Manage Nicknames`);
    if (role.permissions.has(PermissionFlagsBits.ManageGuildExpressions))
      KeyPermissions.push(`Manage Emojis & Stickers`);
    if (role.permissions.has(PermissionFlagsBits.ManageMessages))
      KeyPermissions.push(`Manage Messages`);
    if (role.permissions.has(PermissionFlagsBits.MentionEveryone))
      KeyPermissions.push(`Mention Everyone`);
    if (role.permissions.has(PermissionFlagsBits.ModerateMembers))
      KeyPermissions.push(`Moderate Members`);
  }
  return [KeyPermissions.join(", ") || "No Permissions", KeyPermissions.length];
}

//Better Key Permissions
/*
role.permissions.toArray().map(e=>e.split`_`.map(i=>i[0]+i.match(/\B(\w+)/)[1].toLowerCase()).join` `).filter(f=>f.match(/mem|mana|min|men/gmi))
*/

/**

Returns a string of role mentions based on provided role IDs in an interaction's guild.
@param {Array.<string>} roleIds - An array of role IDs to check and generate mentions for.
@param {Object} interaction - The interaction object passed by the Discord API.
@returns {string} - A string of role mentions if valid role IDs are provided, otherwise an error message.
@example
const roleIds = ['123456789012345678', '234567890123456789'];
const interaction = interaction
roleInGuildCheck(roleIds, interaction); // Returns "<@&123456789012345678> <@&234567890123456789>"
*/

export function roleInGuildCheck(roleIds, interaction) {
  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    return "Error: **roleIds must be a non-empty array**";
  }

  const roleMentions = roleIds
    .filter((roleId) => {
      const role = interaction.guild.roles.cache.get(roleId);
      return role !== undefined;
    })
    .map((roleId) => `<@&${roleId}>`)
    .join(" ");

  if (roleMentions.length === 0) {
    return "Error: **No valid roles were provided**";
  }

  return roleMentions;
}

/**
 * Capitalizes the first letter of a string.
 * @param string - The string to capitalize the first letter of.
 * @returns The input string with the first letter capitalized.
 * If the input string is empty or undefined, an error message is returned.
 * @example
 * capitalizeFirstLetter("hello world"); // "Hello world"
 * capitalizeFirstLetter("jOHN"); // "JOHN"
 * capitalizeFirstLetter(""); // "Error: Input string is empty or undefined."
 * capitalizeFirstLetter(); // "Error: Input string is empty or undefined."
 */
export function capitalizeFirstLetter(string?: string): string {
  if (!string || !string.trim().length) {
    return "Error: Input string is empty or undefined.";
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Returns the slowmode delay for a channel.
 *
 * @param {Discord.TextChannel|Discord.VoiceChannel|Discord.StageChannel} channel - The channel for which to retrieve the slowmode delay.
 * @returns {string} A string representing the slowmode delay for the given channel, or an error message if the channel is undefined or doesn't exist.
 *
 * @example
 * // Returns '10s'
 * channelSlowMode(interaction.channel);
 */

export function channelSlowMode(channel) {
  if (!channel) return "Error: **Channel is undefined or doesn't exist**";

  const slowModeOptions = {
    0: "No Slowmode",
    5: "5s",
    10: "10s",
    15: "15s",
    30: "30s",
    60: "1m",
    120: "2m",
    300: "5m",
    600: "10m",
    900: "15m",
    1800: "30m",
    3600: "1h",
    7200: "2h",
    21600: "6h"
  };

  const delay = channel.rateLimitPerUser;
  return slowModeOptions.hasOwnProperty(delay)
    ? slowModeOptions[delay]
    : "Unknown Slowmode";
}

/**
 * Takes a string and lowercases it then uppercase the first word of each sentence you could say
 * @param {string}  word - The word to be like Custom Status instead of just CUSTOM STATUS
 * @returns {string} - Returns a beautified converted string
 * @example capitalize(string)
 */

export function capitalize(str: string): string {
  return str.replace(/(?<=\W)(\w)/g, (char) => char.toUpperCase());
}
/**
Calculates the BMI scale based on the BMI value.
@param {number} bmi - The BMI value.
@returns {string} The corresponding BMI scale.
@example
BMIScale(18.5); // returns 'Normal'
BMIScale(16); // returns 'Severe Thinness'
*/

export function BMIScale(bmi) {
  let scale;
  switch (true) {
    case bmi < 16:
      scale = "**Severe Thinness**";
      break;
    case bmi >= 16 && bmi <= 17:
      scale = "**Moderate Thinness**";
      break;
    case bmi >= 17 && bmi <= 18.5:
      scale = "**Mild Thinness**";
      break;
    case bmi >= 18.5 && bmi <= 25:
      scale = "**Normal**";
      break;
    case bmi >= 25 && bmi <= 30:
      scale = "**Overweight**";
      break;
    case bmi >= 30 && bmi <= 35:
      scale = "**Obese Class I**";
      break;
    case bmi >= 35 && bmi <= 40:
      scale = "**Obese Class II**";
      break;
    case bmi > 40:
      scale = "**Obese Class III**";
      break;
    default:
      scale = "Invalid BMI value";
      break;
  }
  return scale;
}

/**

Calculates Body Mass Index (BMI) in Imperial or Metric Units.
@param {number} weight - The weight of the person.
@param {number} height - The height of the person in inches or meters, depending on the function.
@returns {number} The BMI of the person.
@example
// returns 22.48
BMIImperial(150, 68)
@example
// returns 23.18
BMIMetric(68, 1.73)
*/

export function BMIImperial(weight, height) {
  return (weight * 703) / (height * height);
}

export function BMIMetric(weight, height) {
  return weight / (height * height);
}

/**

Converts a 24-hour format time to a 12-hour format time with AM or PM.
@param {number} hours - The hours of the time in 24-hour format.
@returns {string|undefined} The time in 12-hour format with AM or PM or undefined if input is invalid.
@example
// returns "9:00 AM"
twentyFourToTwelve(9)
@example
// returns "3:00 PM"
twentyFourToTwelve(15)
@example
// "12:00 AM"
twentyFourToTwelve(0)
@example
// return "12:00 PM"
// twentyFourToTwelve(12);
@example
// returns undefined
twentyFourToTwelve(24)
@example
// returns undefined
twentyFourToTwelve(-1)
*/

export function twentyFourToTwelve(hours: number): string {
  if (isNaN(hours) || hours < 0 || hours > 23) return;

  let displayTime: string;

  if (hours < 12) {
    if (hours === 0) {
      displayTime = `12:00 AM`;
    } else {
      displayTime = `${hours.toFixed(0)}:${((hours % 1) * 60)
        .toFixed(0)
        .padStart(2, "0")} AM`;
    }
  } else {
    hours -= 12;
    if (hours === 0) {
      displayTime = `12:00 PM`;
    } else {
      displayTime = `${hours.toFixed(0)}:${((hours % 1) * 60)
        .toFixed(0)
        .padStart(2, "0")} PM`;
    }
  }

  return displayTime;
}

/**
 *
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

/**

Calculates the amount of RP required to level up to the next rank.
@param {number} rank - The current rank.
@returns {number|string} - The amount of RP required to level up to the next rank, or a string error message if the rank is not a positive integer.
@example
// returns Output: 800
RPRequiredToLevelUp(1);
@example
// return // Output: 5600
RPRequiredToLevelUp(5);
@example
return Output: 'Rank must be a positive integer.'
RPRequiredToLevelUp(-3);
*/

export function RPRequiredToLevelUp(rank: number): number {
  return rank * 800 + (rank - 1) * 400;
}

/**
 * Calculates the rank information based on the given parameters.
 *
 * @param {number} currentRank - The current rank of the user.
 * @param {number} currentRP - The current RP (rank points) of the user.
 * @param {number} addedRP - The additional RP gained by the user.
 * @returns {Array<boolean, number, number>|string} Returns an array containing a boolean value indicating whether the user has ranked up, the number of levels added, and the remaining RP, or a string indicating that the arguments must be positive numbers.
 */

export function checkRank(
  currentLevel: number,
  addedXP: number
): [boolean, number, number] {
  let addedLevels = 0;
  let hasRankedUp = false;

  const currentRank = Math.abs(currentLevel);
  const addedRP = Math.abs(addedXP);

  let requiredRP = RPRequiredToLevelUp(currentRank + addedLevels);

  if (currentRank >= 5000) return [false, 0, 0];

  if (addedRP > requiredRP) {
    hasRankedUp = true;
    addedLevels++;
  }

  let remainingRP = addedRP - requiredRP;
  if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
    for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
      addedLevels++;
      if (currentRank + addedLevels >= 5000) {
        addedLevels--;
        break;
      }
      requiredRP = RPRequiredToLevelUp(currentRank + addedLevels);
    }
  }
  if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;
  if (addedLevels + currentRank >= 5000) addedLevels--;
  return [hasRankedUp, addedLevels, remainingRP];
}

/**
 * Attempts to get a guild's general text channel, or any text channel that the bot has permission to send messages to,
 * optionally searching for channels that match the provided name identity.
 * @param guild - The guild to search for the text channel in.
 * @param nameIdentity - Optional. The name-based identity of the text channel to search for.
 * @returns A `TextChannel` if one is found, or `undefined` if none are found.
 */

export function guildChannels(
  guild: Guild,
  NameIdentity = "general" as string
): TextChannel | undefined {
  let channel: TextChannel | undefined;

  if (guild.channels.cache.has(guild.id)) {
    channel = guild.channels.cache.get(guild.id) as TextChannel;

    if (
      channel
        .permissionsFor(guild.client.user)
        ?.has(PermissionFlagsBits.SendMessages)
    ) {
      return channel;
    }
  }

  channel = guild.channels.cache.find(
    (channel) =>
      channel.name.toLowerCase().includes(NameIdentity) &&
      channel.type === ChannelType.GuildText &&
      channel
        .permissionsFor(guild.client.user)
        ?.has(PermissionFlagsBits.SendMessages)
  ) as TextChannel | undefined;

  if (channel) return channel;

  return guild.channels.cache
    .filter(
      (channel) =>
        channel.type === ChannelType.GuildText &&
        channel
          .permissionsFor(guild.client.user)
          ?.has(PermissionFlagsBits.SendMessages)
    )
    .sort((a: TextChannel, b: TextChannel) => a.position - b.position)
    .first() as TextChannel | undefined;
}

/**
 * Gets the last `count` digits of a snowflake as a string.
 * If the `snowflake` is shorter than `count` digits, returns the entire snowflake.
 *
 * @param {string} snowflake The snowflake to get the last digits from.
 * @param {number} count The number of digits to return.
 * @returns {string} The last `count` digits of the snowflake, not zero-padded.
 */
export function getLastDigits(snowflake: Snowflake, count: number) {
  return snowflake.slice(-count);
}

/**
 * Calculates the reward for a given level.
 * @param level - The level of the user
 * @returns The reward for the given level
 */
export function levelUpReward(level: number): number {
  // Get the absolute rank of the user (level can be negative)
  const rank = Math.abs(level);

  // The array of rewards for each level
  const rewardArray = [
    2000, 4000, 6000, 8000, 12000, 14000, 16000, 18000, 20000, 20000
  ];

  // Calculate the position of the reward in the array based on the modulo of the rank,
  // if it's a multiple of 10 then the position will be 10
  let rewardPosition: number;
  if (rank % 10 == 0) rewardPosition = 10;
  else rewardPosition = rank % 10;

  // Return the reward value from the array based on the calculated position
  return rewardArray[rewardPosition - 1];
}

export function removeSpaces(str: string): string {
  return str.replace(/\s/g, "");
}

export function toLowerCaseArray(arr: string[]): string[] {
  return arr.map((elem) => elem.toLowerCase());
}

export function removeSpacesInUrls(folderPath: string): void {
  const files = fs.readdirSync(folderPath);

  files.forEach((fileName) => {
    const filePath = path.join(folderPath, fileName);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const jsonObject = JSON.parse(fileContent);

    if (hasSpacesInUrls(jsonObject)) {
      traverseAndRemoveSpaces(jsonObject);

      const modifiedContent = JSON.stringify(jsonObject, null, 2);
      fs.writeFileSync(filePath, modifiedContent, "utf-8");
      console.log(`Modified: ${fileName}`);
    } else {
      console.log(`No modifications needed: ${fileName}`);
    }
  });
}

function hasSpacesInUrls(data: any): boolean {
  if (typeof data === "object") {
    for (const key in data) {
      if (
        typeof data[key] === "string" &&
        data[key].includes("http") &&
        data[key].includes(" ")
      ) {
        return true;
      } else if (typeof data[key] === "object") {
        if (hasSpacesInUrls(data[key])) {
          return true;
        }
      }
    }
  }
  return false;
}

function traverseAndRemoveSpaces(data: any): void {
  if (typeof data === "object") {
    for (const key in data) {
      if (typeof data[key] === "string" && data[key].includes("http")) {
        data[key] = data[key].replace(/\s/g, "");
      } else if (typeof data[key] === "object") {
        traverseAndRemoveSpaces(data[key]);
      }
    }
  }
}

export async function SendAndDelete(
  Channel: TextBasedChannel,
  MessageOptions: BaseMessageOptions,
  TimeInSeconds = 5
): Promise<Message<false>> {
  if (Channel instanceof DMChannel) return Channel.send(MessageOptions);
  const message: Message | Interaction = await Channel.send(MessageOptions);

  setTimeout(async () => {
    await message.delete();
  }, TimeInSeconds * 1000);
}

export function chooseRandomFromArray<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function getRole(Server: Guild, roleID: string) {
  return Server.roles.cache.get(roleID);
}

type Obj = Record<string, boolean>;

export function stringifyObjects(obj: Obj, text = "true"): string {
  return Object.entries(obj)
    .filter(([key, value]) => value === true)
    .map(([key]) => `${key}: ${text}`)
    .join("\n");
}

export function trimArray<T>(arr: T[], maxLen = 10, type = `role(s)`): T[] {
  if (arr.length > maxLen) {
    const len = arr.length - maxLen;
    arr = arr.slice(0, maxLen);
    arr.push(` and ${len} more ${type}...` as unknown as T);
  }
  return arr;
}

export function checkPermissions(
  interaction: CommandInteraction | Interaction,
  interactionChannel: TextBasedChannel,
  permissions: PermissionResolvable[]
): boolean {
  if (!(interactionChannel instanceof GuildChannel)) {
    throw new Error(
      "Interaction channel is not a guild channel [checkPermissions function error]"
    );
  }
  return interactionChannel
    .permissionsFor(interaction.guild.members.me)
    .has(permissions as PermissionResolvable, true);
}

interface TimeUnits {
  [key: string]: string[];
}

export const timeUnits: TimeUnits = {
  s: ["sec(s)", "second(s)"],
  min: ["minute(s)", "m", "min(s)"],
  h: ["hr(s)", "hour(s)"],
  d: ["day(s)"],
  w: ["wk(s)", "week(s)"],
  mth: ["mth(s)", "month(s)"],
  y: ["year(s)"],
  a: ["julianyear(s)"],
  dec: ["decade(s)"],
  cen: ["cent(s)", "century", "centuries"]
};

interface TimeUnitValues {
  [key: string]: number;
}

const timeUnitValues: TimeUnitValues = {
  s: 1000,
  min: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
  w: 1000 * 60 * 60 * 24 * 7,
  mth: 1000 * 60 * 60 * 24 * 30,
  y: 1000 * 60 * 60 * 24 * 365,
  a: 1000 * 60 * 60 * 24 * 365.25,
  dec: 1000 * 60 * 60 * 24 * 365 * 10,
  cen: 1000 * 60 * 60 * 24 * 365 * 100
};

interface TimeUnitNames {
  [key: string]: {
    [key: string]: string;
  };
}

const fullTimeUnitNames: TimeUnitNames = {
  s: {
    short: "s",
    medium: "sec",
    long: "second"
  },
  min: {
    short: "m",
    medium: "min",
    long: "minute"
  },
  h: {
    short: "h",
    medium: "hr",
    long: "hour"
  },
  d: {
    short: "d",
    medium: "day",
    long: "day"
  },
  w: {
    short: "wk",
    medium: "wk",
    long: "week"
  },
  mth: {
    short: "mth",
    medium: "mo",
    long: "month"
  },
  y: {
    short: "y",
    medium: "yr",
    long: "year"
  },
  dec: {
    short: "dec",
    medium: "dec",
    long: "decade"
  },
  cen: {
    short: "cen",
    medium: "cent",
    long: "century"
  }
};
