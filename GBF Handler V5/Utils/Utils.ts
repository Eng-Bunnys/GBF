import {
  BaseMessageOptions,
  DMChannel,
  GuildMember,
  Interaction,
  Message,
  PermissionResolvable,
  TextBasedChannel,
} from "discord.js";

export function IsValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

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
