import { BaseMessageOptions, DMChannel, GuildMember, Interaction, Message, PermissionResolvable, TextBasedChannel } from "discord.js";

/**
Returns a string indicating the missing permissions of a target member, compared to the required permissions.
@param {GuildMember} TargetMember - The target member to check the permissions of.
@param {PermissionResolvable | PermissionResolvable[]} RequiredPermissions - The required permissions to check against.
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

export function MissingPermissions(
  TargetMember: GuildMember,
  RequiredPermissions: PermissionResolvable | PermissionResolvable[]
) {
  const missingPerms = TargetMember.permissions
    .missing(RequiredPermissions)
    .map(
      (str) =>
        `\`${str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``
    );

  return missingPerms;
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
