import {
  BaseMessageOptions,
  ChannelType,
  Client,
  DMChannel,
  Guild,
  GuildBasedChannel,
  GuildMember,
  Interaction,
  Message,
  PermissionFlagsBits,
  PermissionResolvable,
  Role,
  Snowflake,
  TextBasedChannel,
  TextChannel,
} from "discord.js";
import { GBF } from "../Handler";
import { client } from "..";

/**
 * Format a string using capitalization.
 * @param {string} str - The input string to be capitalized.
 * @returns {string} The capitalized string.
 * @example
 * // returns "Hello World"
 * Capitalize("hello world")
 */
export function Capitalize(str: string): string {
  return str.replace(/(?<=\W)(\w)/g, (Char) => Char.toUpperCase());
}

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

/**
 * Checks if a string is a valid URL.
 * @param {string} string - The input string to check.
 * @returns {boolean} True if the string is a valid URL, otherwise false.
 * @example
 * // returns true
 * IsValidURL("https://www.example.com");
 */
export function IsValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

const DEFAULT_FORMAT_OPTIONS: TimeFormatOptions = {
  format: "long",
  includeSpaces: false,
  joinDelimiter: " ",
  maxUnitCount: 100,
};

/**
 * Converts milliseconds to a formatted time string.
 * @param {number} duration - The duration in milliseconds.
 * @param {TimeFormatOptions} [options={}] - Options for formatting the time string.
 * @returns {string | undefined} The formatted time string, or undefined if duration is invalid.
 * @example
 * // returns "1 day 2 hours"
 * msToTime(93780000, { format: 'long', includeSpaces: true });
 */
export function msToTime(
  duration: number,
  options: TimeFormatOptions = {}
): string | undefined {
  const { format, includeSpaces, joinDelimiter, maxUnitCount } = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...options,
  };

  if (typeof duration !== "number" || duration < 0) return undefined;

  let FormattedTime = "";
  let UnitCount = 0;

  for (let i = Object.keys(TimeUnitValues).length - 1; i >= 0; i--) {
    const UnitKey = Object.keys(TimeUnitValues)[i];
    if (UnitKey === "year") continue;

    const unitValue = TimeUnitValues[UnitKey];
    let UnitDuration = duration / unitValue;
    if (UnitDuration >= 1) {
      if ((maxUnitCount || 100) < ++UnitCount) break;

      UnitDuration = Math.floor(UnitDuration);
      const unitName = FullTimeUnitNames[UnitKey][format!];
      const pluralSuffix = UnitDuration !== 1 && format !== "short" ? "s" : "";
      FormattedTime += `${UnitDuration} ${unitName}${pluralSuffix}${
        includeSpaces ? " " : joinDelimiter
      }`;
      duration -= UnitDuration * unitValue;
    }
  }

  FormattedTime = FormattedTime.trim();
  return FormattedTime || undefined;
}

/**
 * Checks for missing permissions of a GuildMember.
 * @param {GuildMember} TargetMember - The GuildMember to check permissions for.
 * @param {PermissionResolvable | PermissionResolvable[]} RequiredPermissions - The required permissions.
 * @returns {string[]} An array of missing permissions.
 * @example
 * const member = guild.members.cache.get(user.id);
 * const missingPermissions = MissingPermissions(member, [PermissionFlagBits.ManageChannels]);
 * console.log(missingPermissions); // ['Manage Channels']
 */
export function MissingPermissions(
  TargetMember: GuildMember,
  RequiredPermissions: PermissionResolvable | PermissionResolvable[]
) {
  const MissingPerms = TargetMember.permissions
    .missing(RequiredPermissions)
    .map(
      (str) =>
        `\`${str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``
    );

  return MissingPerms;
}

/**
 * Sends a message to a channel and deletes it after a specified time.
 * @param {TextBasedChannel} Channel - The channel to send the message to.
 * @param {BaseMessageOptions} MessageOptions - The options for the message.
 * @param {number} [TimeInSeconds=5] - The time in seconds after which the message will be deleted.
 * @returns {Promise<Message<false>>} A promise that resolves to the sent message.
 * @example
 * const messageOptions = { content: 'This message will be deleted in 5 seconds.' };
 * SendAndDelete(textChannel, messageOptions, 5)
 *   .then(sentMessage => console.log('Message sent and will be deleted.'))
 *   .catch(console.error);
 */
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
/**
 * Remove emojis from a string
 * @param string The input string that contains emojis
 * @returns {string} The string without emojis
 * @example RemoveEmojis("Hello World 👋")
 * //Output: Hello World
 */
export function RemoveEmojis(string: string) {
  const EmojiRegex =
    /(?:[\u2700-\u27bf]|\ud83c[\udde6-\uddff]{2}|[\ud800-\udbff][\udc00-\udfff]|\u0023-\u0039\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

  return string.replace(EmojiRegex, "");
}

/**
 * Shuffle an array
 * @param {T[]} Array The array shuffle
 * @returns {T[]} The shuffled array
 */
export function ShuffleArray<T>(Array: T[]): T[] {
  const ShuffledArray = [...Array];
  for (let i = ShuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ShuffledArray[i], ShuffledArray[j]] = [ShuffledArray[j], ShuffledArray[i]];
  }
  return ShuffledArray;
}

/**
 * Check if a role exists in a server
 * @param {Snowflake} GuildID The Guild/Server's ID
 * @param {Snowflake} RoleID The Role's ID
 * @param {boolean} DoNotThrow Default: False, to not throw any errors
 * @param {GBF | Client} instance The bot's instance
 * @returns {[boolean, Role]} True if the role is found, the role itself
 * @example RoleInGuild(interaction.guildId, MyRoleID)
 * // Returns: [true, MyRole]
 */
export function RoleInGuild(
  GuildID: Snowflake,
  RoleID: Snowflake,
  DoNotThrow: Boolean = false,
  instance: GBF | Client = client
): [boolean, Role] {
  const Guild = instance.guilds.cache.get(GuildID);

  if (!Guild && !DoNotThrow)
    throw new Error(`The specified Guild "${GuildID}" does not exist.`);
  else if (!Guild) return [false, undefined];

  const FoundRole = Guild.roles.cache.get(RoleID);

  if (!FoundRole) return [false, undefined];

  return [true, FoundRole];
}

/**
 * Find all channels that contain a certain keyword [Case insensitive]
 * @param {Snowflake} GuildID The Guild/Server's ID
 * @param {string} ChannelName The name of the channel that you want to find
 * @param {boolean} Sort Sort the channels based on their positions
 * @param {GBF | Client} instance The client instance
 * @returns {[TextChannel[], number] | undefined} Returns an array of found text channels and the number of channels
 * @example FindChannelByName(interaction.guildId, "General");
 * //Returns: [GeneralChatChannel, GeneralChannel, GeneralTwoChannel, 3]
 */
export function FindChannelByName(
  GuildID: Snowflake,
  ChannelName: string = "general",
  Sort: boolean = true,
  instance: GBF | Client = client
): [TextChannel[], number] | undefined {
  ChannelName = ChannelName.toLowerCase();
  let FoundChannels: TextChannel[] | undefined = [];

  const Guild = instance.guilds.cache.get(GuildID);

  Guild.channels.cache.forEach((Channel: GuildBasedChannel) => {
    if (
      Channel.name.toLowerCase().includes(ChannelName) &&
      Channel.type === ChannelType.GuildText &&
      Channel.permissionsFor(Guild.client.user)?.has(
        PermissionFlagsBits.ViewChannel
      )
    )
      FoundChannels.push(Channel);
  });

  if (Sort)
    FoundChannels = FoundChannels.length
      ? FoundChannels.sort(
          (a: TextChannel, b: TextChannel) => a.position - b.position
        )
      : FoundChannels;

  return FoundChannels.length
    ? [FoundChannels, FoundChannels.length]
    : undefined;
}

interface TimeFormatOptions {
  format?: "long" | "short";
  includeSpaces?: boolean;
  joinDelimiter?: string;
  maxUnitCount?: number;
}

const TimeUnitValues: Record<string, number> = {
  year: 31557600000,
  day: 86400000,
  hour: 3600000,
  minute: 60000,
  second: 1000,
};

const FullTimeUnitNames: Record<string, Record<string, string>> = {
  year: { long: "year", short: "yr" },
  day: { long: "day", short: "day" },
  hour: { long: "hour", short: "hr" },
  minute: { long: "minute", short: "min" },
  second: { long: "second", short: "sec" },
};
