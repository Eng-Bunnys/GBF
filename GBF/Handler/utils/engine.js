const { MessageEmbed, Permissions } = require("discord.js");

const fetch = require("node-fetch");

function processArguments(client, message, msgArgs, expectedArgs) {
  let counter = 0;
  let amount, num, role, member, channel, attach;
  let flags = {};

  for (const argument of expectedArgs) {
    amount = argument.amount && argument.amount > 1 ? argument.amount : 1;

    for (let i = 0; i < amount; i++) {
      if (!msgArgs[counter] && argument.type !== "ATTACHMENT") {
        if (argument.optional) return flags;
        return {
          invalid: true,
          prompt: argument.prompt
        };
      }

      switch (argument.type) {
        case "SOMETHING":
          if (
            argument.words &&
            !argument.words.includes(msgArgs[counter].toLowerCase())
          )
            return {
              invalid: true,
              prompt: argument.prompt
            };
          else if (argument.regexp && !argument.regexp.test(msgArgs[counter]))
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (amount == 1) flags[argument.id] = msgArgs[counter];
          else if (flags[argument.id])
            flags[argument.id].push(msgArgs[counter]);
          else flags[argument.id] = [msgArgs[counter]];
          break;

        case "NUMBER":
          num = Number(msgArgs[counter]);
          if (isNaN(num))
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (argument.min && argument.min > num)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (argument.max && argument.max < num)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          //@ts-ignore
          if (argument.toInteger) num = parseInt(num);

          if (amount == 1) flags[argument.id] = num;
          else if (flags[argument.id]) flags[argument.id].push(num);
          else flags[argument.id] = [num];
          break;

        case "CHANNEL":
          if (
            msgArgs[counter].startsWith("<#") &&
            msgArgs[counter].endsWith(">")
          )
            channel = message.guild.channels.cache.get(
              msgArgs[counter].slice(2, -1)
            );
          else channel = message.guild.channels.cache.get(msgArgs[counter]);

          if (!channel)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (
            argument.channelTypes &&
            !argument.channelTypes.includes(channel.type)
          )
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (amount == 1) flags[argument.id] = channel;
          else if (flags[argument.id]) flags[argument.id].push(channel);
          else flags[argument.id] = [channel];
          break;

        case "ROLE":
          if (
            msgArgs[counter].startsWith("<@&") &&
            msgArgs[counter].endsWith(">")
          )
            role = message.guild.roles.cache.get(msgArgs[counter].slice(3, -1));
          else role = message.guild.roles.cache.get(msgArgs[counter]);

          if (!role)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (argument.notBot && role.managed)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (amount == 1) flags[argument.id] = role;
          else if (flags[argument.id]) flags[argument.id].push(role);
          else flags[argument.id] = [role];
          break;

        case "AUTHOR_OR_MEMBER":
          if (
            msgArgs[counter] &&
            (msgArgs[counter].startsWith("<@") ||
              (msgArgs[counter].startsWith("<@!") &&
                msgArgs[counter].endsWith(">")))
          )
            member = message.guild.members.cache.get(
              msgArgs[counter]
                .replace("<@", "")
                .replace("!", "")
                .replace(">", "")
            );
          else member = message.guild.members.cache.get(msgArgs[counter]);

          if (!member) flags[argument.id] = message.member;
          else flags[argument.id] = member;

          if (argument.toUser) flags[argument.id] = flags[argument.id].user;
          break;

        case "MEMBER":
          if (
            msgArgs[counter].startsWith("<@") ||
            (msgArgs[counter].startsWith("<@!") &&
              msgArgs[counter].endsWith(">"))
          )
            member = message.guild.members.cache.get(
              msgArgs[counter]
                .replace("<@", "")
                .replace("!", "")
                .replace(">", "")
            );
          else member = message.guild.members.cache.get(msgArgs[counter]);

          if (!member)
            return {
              invalid: true,
              prompt: argument.prompt
            };
          else {
            if (argument.notBot && member.user.bot)
              return {
                invalid: true,
                prompt: argument.prompt
              };

            if (argument.notSelf && member.id === message.author.id)
              return {
                invalid: true,
                prompt: argument.prompt
              };

            if (argument.toUser) member = member.user;

            if (amount == 1) flags[argument.id] = member;
            else if (flags[argument.id]) flags[argument.id].push(member);
            else flags[argument.id] = [member];
          }
          break;

        case "ATTACHMENT":
          if (message.attachments.size === 0)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          attach = message.attachments.filter((a) => {
            let accepted = false;

            argument.attachmentTypes.forEach((type) => {
              if (a.proxyURL.endsWith(type)) accepted = true;
            });

            return accepted;
          });

          if (attach.size === 0 && argument.optional) return flags;
          else if (attach.size === 0)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          flags[argument.id] = attach.first();
          break;

        case "TIME":
          num = client.utils.timeToMs(msgArgs.slice(counter).join(""));

          if (!num)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (argument.min && num < argument.min)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          if (argument.max && num > argument.max)
            return {
              invalid: true,
              prompt: argument.prompt
            };

          flags[argument.id] = num;
          break;

        default:
          return console.log(
            `The argument type ${argument.type} doesn't exist.`
          );
      }

      counter++;
    }
  }
  return flags;
}

/**
 * Function to automatically send paginated embeds and switch between the pages by listening to the user reactions
 * @param {Message} message - Used to send the paginated message to the channel, get the user, etc.
 * @param {MessageEmbed[]} embeds - The array of embeds to switch between
 * @param {*} [options] - Optional parameters
 * @param {number} [options.time] - The max time for createReactionCollector
 * @example Examples can be seen in `src/utils/utils.md`
 */
//Non-button based pagination
async function paginate(message, embeds, options) {
  try {
    const pageMsg = await message.channel.send({
      embeds: [embeds[0]]
    });

    for (const emote of reactions) {
      await pageMsg.react(emote);
      await this.delay(750);
    }

    let pageIndex = 0;
    let time = 30000;

    if (options) {
      if (options.time) time = options.time;
    }

    const collector = pageMsg.createReactionCollector({
      filter: (reaction, user) =>
        reactions.includes(reaction.emoji.name) &&
        user.id === message.author.id,
      time
    });
    collector.on("collect", async (reaction, user) => {
      try {
        pageIndex = await handleReaction({
          reaction: reaction,
          collector: collector,
          embeds: embeds,
          pageMsg: pageMsg,
          pageIndex: pageIndex
        });
      } catch (e) {}
    });

    collector.on("remove", async (reaction, user) => {
      try {
        pageIndex = await handleReaction({
          reaction: reaction,
          collector: collector,
          embeds: embeds,
          pageMsg: pageMsg,
          pageIndex: pageIndex
        });
      } catch (e) {}
    });

    collector.on("end", async () => {
      try {
        await pageMsg.reactions.removeAll();
      } catch (e) {}
    });
  } catch (e) {}
}

/**
 * Function to await a reply from a specific user.
 * @param {import('discord.js').Message} message - The message to listen to
 * @param {object} [options] - Optional parameters
 * @param {number} [options.time] - The max time for awaitMessages
 * @param {import('discord.js').User} [options.user] - The user to listen to messages to
 * @param {string[]} [options.words] - Optional accepted words, will aceept any word if not provided
 * @param {RegExp} [options.regexp] - Optional RegExp to accept user input that matches the RegExp
 * @return {Promise<import('discord.js').Message>} Returns the `message` sent by the user if there was one, returns `false` otherwise.
 * @example const reply = await getReply(message, { time: 10000, words: ['yes', 'y', 'n', 'no'] })
 */

async function getReply(message, options) {
  let time = 30000;
  let user = message.author;
  let words = [];

  if (options) {
    if (options.time) time = options.time;
    if (options.user) user = options.user;
    if (options.words) words = options.words;
  }

  const filter = (msg) => {
    return (
      msg.author.id === user.id &&
      (words.length === 0 || words.includes(msg.content.toLowerCase())) &&
      (!options || !options.regexp || options.regexp.test(msg.content))
    );
  };

  const msgs = await message.channel.awaitMessages({
    filter,
    max: 1,
    time
  });

  if (msgs.size > 0) return msgs.first();
  return;
}

/**
 * Return an random integer between `min` and `max` (both inclusive)
 * @param {number} min - The lower bound
 * @param {number} max - The upper bound
 * @return {number}

 * @example const rand = randomRange(0, 10)
 */
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Function to set a timeout
 * @param {number} ms - Time to wait in milliseconds
 * @return {promise}

 * @example await delay(5000)
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function msToTime(time, options = {}) {
  if (
    options.format === undefined ||
    (options.format !== "short" &&
      options.format !== "medium" &&
      options.format !== "long")
  )
    options.format = "long";

  if (options.spaces === undefined) options.spaces = true;
  if (options.joinString === undefined) options.joinString = " ";

  let timeStr = "";
  let nr = 0;

  for (let i = Object.keys(timeUnitValues).length; i >= 0; --i) {
    let key = Object.keys(timeUnitValues)[i];
    if (key === "a") continue;

    let ctime = time / timeUnitValues[key];
    if (ctime >= 1) {
      if ((options.unitRounding ?? 100) < ++nr) break;

      ctime = Math.floor(ctime);
      timeStr += ctime;
      timeStr +=
        options.spaces === true && options.format !== "short" ? " " : "";
      timeStr +=
        fullTimeUnitNames[key][options.format] +
        (ctime !== 1 && options.format !== "short" ? "s" : "");
      timeStr += options.spaces === true ? options.joinString : "";
      time -= ctime * timeUnitValues[key];
    }
  }

  while (timeStr.endsWith(options.joinString))
    timeStr = timeStr.slice(0, -1 * options.joinString.length);

  if (timeStr === "") return undefined;
  else return timeStr;
}

function betterMSToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " Seconds";
  else if (minutes < 60) return minutes + " Minutes";
  else if (hours < 24) return hours + " Hours";
  else return days + " Days";
}

function resume(text, number) {
  let str = "";
  if (text.length > number) {
    str += text.substring(0, number);
    str += "...";
    return str;
  } else {
    str += text;
    return str;
  }
}

function MessageSplit(message, codelength) {
  let ArrayNeeded = [];

  if (!message) return [];

  if (Array.isArray(message)) {
    message = message.join("\n");
  }

  if (message.length > codelength) {
    let string = "",
      position;
    while (message.length > 0) {
      position =
        message.length > codelength
          ? message.lastIndexOf("\n", codelength)
          : message.length;
      if (position > codelength) position = codelength;
      string = message.substr(0, position);
      message = message.substr(position);
      ArrayNeeded.push(string);
    }
  } else {
    ArrayNeeded.push(message);
  }
  return ArrayNeeded;
}

function missingPermissions(member, permission) {
  const PermsMissing = member.permissions.missing(permission).map(
    (str) =>
      `\`${str
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``
  );

  return PermsMissing.length > 1
    ? `${PermsMissing.slice(0, -1).join(", ")}, ${PermsMissing.slice(-1)[0]}`
    : PermsMissing[0];
}

function removeEmojis(string) {
  let regex =
    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  return string.replace(regex, "");
}

function hasNumber() {
  return /\d/.test();
}

function Arraytoshuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function rolePermissions(role) {
  const rolePerms = role.permissions.toArray().map(
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

function KeyPerms(role) {
  let KeyPermissions = [];

  if (role.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
    KeyPermissions.push(`Administrator`);
  if (role.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
    KeyPermissions.push(`Manage Server`);
  if (role.permissions.has(Permissions.FLAGS.MANAGE_ROLES))
    KeyPermissions.push(`Manage Roles`);
  if (role.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
    KeyPermissions.push(`Manage Channels`);
  if (role.permissions.has(Permissions.FLAGS.KICK_MEMBERS))
    KeyPermissions.push(`Kick Members`);
  if (role.permissions.has(Permissions.FLAGS.BAN_MEMBERS))
    KeyPermissions.push(`Ban Members`);
  if (role.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES))
    KeyPermissions.push(`Manage Nicknames`);
  if (role.permissions.has(Permissions.FLAGS.CHANGE_NICKNAME))
    KeyPermissions.push(`Change Nickname`);
  if (role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS))
    KeyPermissions.push(`Manage Emojis & Stickers`);
  if (role.permissions.has(Permissions.FLAGS.MANAGE_WEBHOOKS))
    KeyPermissions.push(`Manage Webhooks`);
  if (role.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
    KeyPermissions.push(`Manage Messages`);
  if (role.permissions.has(Permissions.FLAGS.MENTION_EVERYONE))
    KeyPermissions.push(`Mention Everyone`);
  if (role.permissions.has(Permissions.FLAGS.USE_EXTERNAL_EMOJIS))
    KeyPermissions.push(`Use External Emojis`);
  if (role.permissions.has(Permissions.FLAGS.ADD_REACTIONS))
    KeyPermissions.push(`Add Reactions`);
  if (role.permissions.has(Permissions.FLAGS.MUTE_MEMBERS))
    KeyPermissions.push(`Mute Members`);
  if (role.permissions.has(Permissions.FLAGS.DEAFEN_MEMBERS))
    KeyPermissions.push(`Deafen Members`);
  if (role.permissions.has(Permissions.FLAGS.MOVE_MEMBERS))
    KeyPermissions.push(`Move Members`);
  if (role.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS))
    KeyPermissions.push(`Moderate Members`);
  if (role.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG))
    KeyPermissions.push(`View Audit Log`);
  if (role.permissions.has("SEND_MESSAGES"))
    KeyPermissions.push(`Send Messages`);
  if (role.permissions.has("ATTACH_FILES")) KeyPermissions.push(`Attach Files`);
  if (role.permissions.has("READ_MESSAGE_HISTORY"))
    KeyPermissions.push(`Read Message History`);
  if (role.permissions.has("CREATE_INSTANT_INVITE"))
    KeyPermissions.push(`Create Instant Invite`);

  return KeyPermissions;
}

//Better Key Permissions
/*
role.permissions.toArray().map(e=>e.split`_`.map(i=>i[0]+i.match(/\B(\w+)/)[1].toLowerCase()).join` `).filter(f=>f.match(/mem|mana|min|men/gmi))
*/

function roleInGuildCheck(roleIds) {
  if (roleIds.length < 2) {
    return `<@&${roleIds[0]}>`;
  }

  return roleIds.length > 1
    ? `<@&${roleIds.slice(0, -1).join(", ")}> <@&${roleIds.slice(-1)[0]}>`
    : roleIds[0];
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function channelType(channel) {
  let DisplayType;
  if (channel.type === "GUILD_TEXT") DisplayType = "Text Channel";
  else if (channel.type === "GUILD_VOICE") DisplayType = "Voice Channel";
  else if (channel.type === "GUILD_CATEGORY") DisplayType = "Category Channel";
  else if (channel.type === "GUILD_NEWS") DisplayType = "News Channel";
  else if (channel.type === "GUILD_NEWS_THREAD")
    DisplayType = "News Channel Thread";
  else if (channel.type === "GUILD_PUBLIC_THREAD")
    DisplayType = "Public Channel Thread";
  else if (channel.type === "GUILD_PRIVATE_THREAD")
    DisplayType = "Private Channel Thread";
  else if (channel.type === "GUILD_STAGE_VOICE")
    DisplayType = "Stage Voice Channel";
  else if (channel.type === "UNKNOWN") DisplayType = "⚠ Unknown Channel Type ⚠";
  return DisplayType;
}

function channelSlowMode(channel) {
  let SlowModeTimer;
  if (channel.rateLimitPerUser === 0) SlowModeTimer = "No Slowmode";
  else if (channel.rateLimitPerUser === 5) SlowModeTimer = "5s";
  else if (channel.rateLimitPerUser === 10) SlowModeTimer = "10s";
  else if (channel.rateLimitPerUser === 15) SlowModeTimer = "15s";
  else if (channel.rateLimitPerUser === 30) SlowModeTimer = "30s";
  else if (channel.rateLimitPerUser === 60) SlowModeTimer = "1m";
  else if (channel.rateLimitPerUser === 120) SlowModeTimer = "2m";
  else if (channel.rateLimitPerUser === 300) SlowModeTimer = "5m";
  else if (channel.rateLimitPerUser === 600) SlowModeTimer = "10m";
  else if (channel.rateLimitPerUser === 900) SlowModeTimer = "15m";
  else if (channel.rateLimitPerUser === 1800) SlowModeTimer = "30m";
  else if (channel.rateLimitPerUser === 3600) SlowModeTimer = "1h";
  else if (channel.rateLimitPerUser === 7200) SlowModeTimer = "2h";
  else if (channel.rateLimitPerUser === 21600) SlowModeTimer = "6h";
  return SlowModeTimer;
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

function BMIScale(bmi) {
  let Scale;
  if (bmi < 16) {
    Scale = `**Severe Thinness**`;
  } else if (bmi >= 16 && bmi <= 17) {
    Scale = `**Moderate Thinness**`;
  } else if (bmi >= 17 && bmi <= 18.5) {
    Scale = `**Mild Thinness**`;
  } else if (bmi >= 18.5 && bmi <= 25) {
    Scale = `**Normal**`;
  } else if (bmi >= 25 && bmi <= 30) {
    Scale = `**Overweight**`;
  } else if (bmi >= 30 && bmi <= 35) {
    Scale = `**Obese Class I**`;
  } else if (bmi >= 35 && bmi <= 40) {
    Scale = `**Obese Class II**`;
  } else if (bmi > 40) {
    Scale = `**Obese Class III**`;
  }
  return Scale;
}

function BMIImperial(weight, height) {
  return (weight * 703) / (height * height);
}

function BMIMetric(weight, height) {
  return weight / (height * height);
}

async function hasProfanity(text) {
  try {
    let hasProfanity;

    await fetch(`https://luminabot.xyz/api/json/containsprofanity?text=${text}`)
      .then((response) => response.json())
      .then((data) => {
        hasProfanity = data.isSwear;
      });
    return hasProfanity;
  } catch (err) {
    return err;
  }
}

module.exports = {
  processArguments,
  paginate,
  getReply,
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
  betterMSToTime,
  hasProfanity
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
