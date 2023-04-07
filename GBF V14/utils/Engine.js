const {
  PermissionFlagsBits,
  Role,
  ChannelType,
  GuildMember
} = require("discord.js");

/**
 * Generates a random integer between the given minimum and maximum values (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer between min and max (inclusive).
 */
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Delay the execution of the next instruction by a specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to delay the execution.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
function delay(ms) {
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

function msToTime(time, options = {}) {
  const defaultOptions = {
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
 * @returns {string} A string representation of the duration in the format "X Days", "X Hours", "X Minutes", or "X Seconds".
 *
 * @example
 * const duration = 123456789;
 * const formattedDuration = basicMsToTime(duration);
 * console.log(formattedDuration); // Output: "1.5 Days"
 */

function basicMsToTime(ms) {
  const seconds = (ms / 1000).toFixed(1);
  const minutes = (ms / (1000 * 60)).toFixed(1);
  const hours = (ms / (1000 * 60 * 60)).toFixed(1);
  const days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

  if (seconds < 60) {
    return `${seconds} Seconds`;
  } else if (minutes < 60) {
    return `${minutes} Minutes`;
  } else if (hours < 24) {
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

function resume(text = "", number) {
  if (typeof text !== "string") {
    return "The text parameter must be a string.";
  }

  if (!Number.isInteger(number) || number < 1) {
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

function MessageSplit(message, codeLength, separator = "\n") {
  if (!message) return [];

  if (!Number.isInteger(codeLength) || codeLength <= 0) {
    return "Code length must be a positive integer";
  }

  const arrayNeeded = [];

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

function missingPermissions(targetMember, requiredPermissions) {
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

function removeEmojis(string) {
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

function hasNumber(str) {
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

function Arraytoshuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function rolePermissions(targetRole) {
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

/**
 * Returns the permissions of a role as a string, with the most powerful permission listed first.
 *
 * @param {Role} role - The role whose permissions will be listed.
 * @returns {string} A string listing the permissions of the role.
 *
 * @example
 * // Returns "Administrator, Manage Server, Kick Members"
 * const role = interaction.guild.roles.cache.find(role => role.name === "Moderator");
 * const perms = KeyPerms(role);
 * console.log(perms);
 */

function KeyPerms(role) {
  const permissions = [
    { name: "Administrator", flag: PermissionFlagsBits.Administrator },
    { name: "Manage Server", flag: PermissionFlagsBits.ManageGuild },
    { name: "Manage Roles", flag: PermissionFlagsBits.ManageRoles },
    { name: "Manage Channels", flag: PermissionFlagsBits.ManageChannels },
    { name: "Kick Members", flag: PermissionFlagsBits.KickMembers },
    { name: "Ban Members", flag: PermissionFlagsBits.BanMembers },
    { name: "Manage Nicknames", flag: PermissionFlagsBits.ManageNicknames },
    { name: "Change Nickname", flag: PermissionFlagsBits.ChangeNickname },
    {
      name: "Manage Emojis & Stickers",
      flag: PermissionFlagsBits.ManageEmojisAndStickers
    },
    { name: "Manage Webhooks", flag: PermissionFlagsBits.ManageWebhooks },
    { name: "Manage Messages", flag: PermissionFlagsBits.ManageMessages },
    { name: "Mention Everyone", flag: PermissionFlagsBits.MentionEveryone },
    {
      name: "Use External Emojis",
      flag: PermissionFlagsBits.UseExternalEmojis
    },
    { name: "Add Reactions", flag: PermissionFlagsBits.AddReactions },
    { name: "Mute Members", flag: PermissionFlagsBits.MuteMembers },
    { name: "Deafen Members", flag: PermissionFlagsBits.DeafenMembers },
    { name: "Move Members", flag: PermissionFlagsBits.MoveMembers },
    { name: "Moderate Members", flag: PermissionFlagsBits.ModerateMembers },
    { name: "View Audit Log", flag: PermissionFlagsBits.ViewAuditLog },
    { name: "Send Messages", flag: PermissionFlagsBits.SendMessages },
    { name: "Attach Files", flag: PermissionFlagsBits.AttachFiles },
    {
      name: "Read Message History",
      flag: PermissionFlagsBits.ReadMessageHistory
    },
    {
      name: "Create Instant Invite",
      flag: PermissionFlagsBits.CreateInstantInvite
    }
  ];

  const sortedPermissions = permissions
    .filter((perm) => role.permissions.has(perm.flag))
    .sort((permA, permB) => Number(permB.flag) - Number(permA.flag));

  if (role.managed) {
    return "Administrator";
  } else if (role.permissions.has(PermissionFlagsBits.Administrator)) {
    return (
      "Administrator, " +
      sortedPermissions
        .filter(
          (perm) => perm.flag !== BigInt(PermissionFlagsBits.Administrator)
        )
        .map((perm) => perm.name)
        .join(", ")
    );
  } else {
    return sortedPermissions.length > 0
      ? sortedPermissions.map((perm) => perm.name).join(", ")
      : "No permissions";
  }
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

function roleInGuildCheck(roleIds, interaction) {
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

Capitalizes the first letter of a string.
@param {string} string - The string to capitalize the first letter of.
@returns {string} The input string with the first letter capitalized.
If the input string is empty or undefined, an error message is returned.
@example
capitalizeFirstLetter("hello world"); // "Hello world"
capitalizeFirstLetter("jOHN"); // "JOHN"
capitalizeFirstLetter(""); // "Error: Input string is empty or undefined."
capitalizeFirstLetter(); // "Error: Input string is empty or undefined."
*/

function capitalizeFirstLetter(string) {
  if (!string || !string.trim().length) {
    return "Error: **Input string is empty or undefined.**";
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**

Determines the display type of a Discord channel based on its type.
@param {Discord.Channel} channel - The Discord channel to check.
@returns {string} The display type of the channel.
@example
const channelDisplayType = channelType(interaction.channel);
console.log(This is a ${channelDisplayType}.); // Returns Text Channel
*/

function channelType(channel) {
  if (!channel) return "Error: **Channel is undefined or doesn't exist**";

  let displayType;
  switch (channel.type) {
    case "GUILD_TEXT":
      displayType = "Text Channel";
      break;
    case "GUILD_VOICE":
      displayType = "Voice Channel";
      break;
    case "GUILD_CATEGORY":
      displayType = "Category Channel";
      break;
    case "GUILD_NEWS":
      displayType = "News Channel";
      break;
    case "GUILD_NEWS_THREAD":
      displayType = "News Channel Thread";
      break;
    case "GUILD_PUBLIC_THREAD":
      displayType = "Public Channel Thread";
      break;
    case "GUILD_PRIVATE_THREAD":
      displayType = "Private Channel Thread";
      break;
    case "GUILD_STAGE_VOICE":
      displayType = "Stage Voice Channel";
      break;
    case "UNKNOWN":
      displayType = "⚠ Unknown Channel Type ⚠";
      break;
    default:
      return `Error: unrecognized channel type ${channel.type}`;
    //displayType = ' ';
  }
  return displayType;
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

function channelSlowMode(channel) {
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
 * @param {string} the word - The word to be like Custom Status instead of just CUSTOM STATUS
 * @returns {string} - Returns a beautified converted string
 * @example capitalize(string)
 */

function capitalize(string) {
  return string
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b(\w)/g, (char) => char.toUpperCase());
}

/**

Calculates the BMI scale based on the BMI value.
@param {number} bmi - The BMI value.
@returns {string} The corresponding BMI scale.
@example
BMIScale(18.5); // returns 'Normal'
BMIScale(16); // returns 'Severe Thinness'
*/

function BMIScale(bmi) {
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

function BMIImperial(weight, height) {
  return (weight * 703) / (height * height);
}

function BMIMetric(weight, height) {
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

function twentyFourToTwelve(hours) {
  if (isNaN(hours) || hours < 0 || hours > 23) return;

  let displayTime;

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
 * @param {*} array [Numbers array that contains the data you want to split]
 * @param {*} size [The maximum number of elements in each array]
 * @returns {array} [[...], [...]]
 */

function chunkAverage(array, size) {
  let renderedChunk;
  let chunkSum = 0;

  const chunkArray = [...array];
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

function RPRequiredToLevelUp(rank) {
  if (!Number.isInteger(rank) || rank <= 0)
    return "Rank must be a positive integer.";

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

function checkRank(currentLevel, currentXP, addedXP) {
  let addedLevels = 0;
  let hasRankedUp = false;

  const currentRank = Math.abs(currentLevel);
  const currentRP = Math.abs(currentXP);
  const addedRP = Math.abs(addedXP);

  let requiredRP = RPRequiredToLevelUp(currentRank + addedLevels, currentRP);

  if (currentRank >= 5000) return;

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
      requiredRP = RPRequiredToLevelUp(currentRank + addedLevels, currentRP);
    }
  }
  if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;
  if (addedLevels + currentRank >= 5000) addedLevels--;
  return [hasRankedUp, addedLevels, remainingRP];
}

function guildChannels(guild) {
  let channel;
  if (guild.channels.cache.has(guild.id)) {
    channel = guild.channels.cache.get(guild.id);
    if (
      channel
        .permissionsFor(guild.client.user)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      return guild.channels.cache.get(guild.id);
    }
  }

  channel = guild.channels.cache.find(
    (channel) =>
      channel.name.includes("general") &&
      channel
        .permissionsFor(guild.client.user)
        .has(PermissionFlagsBits.SendMessages) &&
      channel.type === ChannelType.GuildText
  );
  if (channel) return channel;

  return guild.channels.cache
    .filter(
      (c) =>
        c.type === ChannelType.GuildText &&
        c
          .permissionsFor(guild.client.user)
          .has(PermissionFlagsBits.SendMessages)
    )
    .sort((a, b) => a.position - b.position)
    .first();
}

module.exports = {
  randomRange,
  delay,
  msToTime,
  resume,
  MessageSplit,
  missingPermissions,
  removeEmojis,
  hasNumber,
  Arraytoshuffle,
  rolePermissions,
  KeyPerms,
  roleInGuildCheck,
  capitalizeFirstLetter,
  channelSlowMode,
  channelType,
  capitalize,
  BMIScale,
  BMIImperial,
  BMIMetric,
  basicMsToTime,
  twentyFourToTwelve,
  chunkAverage,
  RPRequiredToLevelUp,
  checkRank,
  guildChannels
};

const timeUnits = {
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

const timeUnitValues = {
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

const fullTimeUnitNames = {
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
