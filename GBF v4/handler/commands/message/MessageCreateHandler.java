package org.bunnys.handler.commands.message;

import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.UserSnowflake;
import net.dv8tion.jda.api.entities.channel.attribute.INSFWChannel;
import net.dv8tion.jda.api.entities.channel.middleman.GuildChannel;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.utils.messages.MessageCreateData;
import org.bunnys.handler.GBF;
import org.bunnys.handler.utils.TimestampUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static org.bunnys.utils.Utils.sendAndDelete;

public class MessageCreateHandler {
    private final MessageReceivedEvent event;
    private final Message message;
    private final GBF client;

    private static final Map<String, Map<String, Long>> commandCooldowns = new ConcurrentHashMap<>();
    private static final ScheduledExecutorService cleanupScheduler = new ScheduledThreadPoolExecutor(1);
    private static final long MAX_COOLDOWN = 3600;
    private static final long MIN_COOLDOWN = 1;
    private static final long DEFAULT_DELAY = 5;

    public record CommandData(MessageCommand command, String commandName, String[] args) {}

    public MessageCreateHandler(MessageReceivedEvent event) {
        this.client = GBF.getClient();
        this.event = event;
        this.message = event.getMessage();
    }

    /**
     * Processes the message event and performs all necessary checks
     * @return CommandData containing command, commandName, and args if checks pass, or null if they fail
     */
    public CommandData process() {
        if (event.getAuthor().isBot() || !message.isFromGuild()) {
            return null;
        }

        Guild guild = event.getGuild();
        Member member = event.getMember();
        Member selfMember = guild.getSelfMember();
        String userId = event.getAuthor().getId();
        String content = message.getContentRaw();
        String prefix = client.getConfig().Prefix();

        if (!content.startsWith(prefix)) {
            return null;
        }

        String[] split = content.substring(prefix.length()).split("\\s+", 2);
        String commandName = client.resolveCommandFromAlias(split[0]);
        MessageCommand command = client.getMessageCommand(commandName);

        if (command == null) {
            return null;
        }

        MessageCommandConfig options = command.CommandOptions();
        MessageChannel channel = message.getChannel();

        // NSFW check
        if (options.isNsfw() && (!(channel instanceof INSFWChannel) || !((INSFWChannel) channel).isNSFW())) {
            sendAndDelete(channel,
                    MessageCreateData.fromContent(event.getAuthor().getAsMention() + ", This command can only be used in NSFW channels"),
                    DEFAULT_DELAY);
            return null;
        }

        // Developer-only check
        if (options.isDeveloperOnly() && !client.getConfig().Developers().contains(UserSnowflake.fromId(userId))) {
            sendAndDelete(channel,
                    MessageCreateData.fromContent(event.getAuthor().getAsMention() + ", This command can only be used by developers"),
                    DEFAULT_DELAY);
            return null;
        }

        // User permission check
        List<Permission> requiredUserPerms = options.getRequiredUserPermissions();
        if (!requiredUserPerms.isEmpty() && member != null) {
            List<Permission> missingPerms = new ArrayList<>(requiredUserPerms);
            missingPerms.removeAll(member.getPermissions((GuildChannel) channel));
            if (!missingPerms.isEmpty()) {
                String readablePerms = missingPerms.stream()
                        .map(this::getReadablePermissionName)
                        .collect(Collectors.joining(", "));
                sendAndDelete(channel,
                        MessageCreateData.fromContent(
                                String.format("%s, You lack the following permissions: %s",
                                        event.getAuthor().getAsMention(), readablePerms)),
                        DEFAULT_DELAY);
                return null;
            }
        }

        // Bot permission check
        List<Permission> requiredBotPerms = options.getRequiredBotPermissions();
        if (!requiredBotPerms.isEmpty()) {
            List<Permission> missingBotPerms = new ArrayList<>(requiredBotPerms);
            missingBotPerms.removeAll(selfMember.getPermissions((GuildChannel) channel));
            if (!missingBotPerms.isEmpty()) {
                String readablePerms = missingBotPerms.stream()
                        .map(this::getReadablePermissionName)
                        .collect(Collectors.joining(", "));
                sendAndDelete(channel,
                        MessageCreateData.fromContent(
                                String.format("I lack the following permissions to execute this command: %s", readablePerms)),
                        DEFAULT_DELAY);
                return null;
            }
        }

        // Cooldown check
        float cooldown = options.getCooldown();
        if (cooldown > 0 && !client.getConfig().Developers().contains(UserSnowflake.fromId(userId))) {
            long safeCooldown = Math.max(MIN_COOLDOWN, Math.min(MAX_COOLDOWN, (long) cooldown));
            Map<String, Long> userTimestamps = commandCooldowns.computeIfAbsent(commandName, k -> new ConcurrentHashMap<>());
            long currentTime = System.currentTimeMillis();
            long cooldownMillis = safeCooldown * 1000;

            Long lastUsed = userTimestamps.get(userId);
            if (lastUsed != null) {
                long expirationTime = lastUsed + cooldownMillis;
                if (currentTime < expirationTime) {
                    long remainingTimeSeconds = (expirationTime - currentTime + 999) / 1000;
                    String formattedTimestamp = TimestampUtils.getTimestamp(
                            new java.util.Date(expirationTime), TimestampUtils.UnixFormat.R);
                    sendAndDelete(channel,
                            MessageCreateData.fromContent(
                                    String.format("%s, You can use '%s' %s",
                                            event.getAuthor().getAsMention(),
                                            commandName,
                                            formattedTimestamp)),
                            remainingTimeSeconds);
                    return null;
                }
            }

            userTimestamps.put(userId, currentTime);
            cleanupScheduler.schedule(() -> userTimestamps.remove(userId), safeCooldown, TimeUnit.SECONDS);
        }

        String[] args = split.length > 1 && !split[1].isBlank()
                ? split[1].trim().split("\\s+")
                : new String[0];

        return new CommandData(command, commandName, args);
    }

    /**
     * Converts a Permission enum to a human-readable name
     * @param permission The permission to convert
     * @return A readable name (e.g., "KICK_MEMBERS" -> "Kick Members")
     */
    private String getReadablePermissionName(Permission permission) {
        return switch (permission) {
            case KICK_MEMBERS -> "Kick Members";
            case BAN_MEMBERS -> "Ban Members";
            case ADMINISTRATOR -> "Administrator";
            case MANAGE_CHANNEL -> "Manage Channels";
            case MANAGE_SERVER -> "Manage Server";
            case MESSAGE_ADD_REACTION -> "Add Reactions";
            case VIEW_AUDIT_LOGS -> "View Audit Logs";
         //   case MESSAGE_READ -> "Read Messages";
            case MESSAGE_WRITE -> "Send Messages";
            case MESSAGE_TTS -> "Send TTS Messages";
            case MESSAGE_MANAGE -> "Manage Messages";
            case MESSAGE_EMBED_LINKS -> "Embed Links";
            case MESSAGE_ATTACH_FILES -> "Attach Files";
            case MESSAGE_HISTORY -> "Read Message History";
            case MESSAGE_MENTION_EVERYONE -> "Mention Everyone";
            case MESSAGE_EXT_EMOJI -> "Use External Emojis";
            case MANAGE_ROLES -> "Manage Roles";
            case MANAGE_PERMISSIONS -> "Manage Permissions";
            case MANAGE_WEBHOOKS -> "Manage Webhooks";
            case MANAGE_EMOJIS_AND_STICKERS -> "Manage Emojis and Stickers";
            case MANAGE_EVENTS -> "Manage Events";
            case MANAGE_THREADS -> "Manage Threads";
            case MODERATE_MEMBERS -> "Moderate Members";
            case VIEW_CHANNEL -> "View Channels";
            case CREATE_INSTANT_INVITE -> "Create Invite";
            case NICKNAME_CHANGE -> "Change Nickname";
            case NICKNAME_MANAGE -> "Manage Nicknames";
            case VOICE_STREAM -> "Stream";
            case VOICE_CONNECT -> "Connect";
            case VOICE_SPEAK -> "Speak";
            case VOICE_MUTE_OTHERS -> "Mute Members";
            case VOICE_DEAF_OTHERS -> "Deafen Members";
            case VOICE_MOVE_OTHERS -> "Move Members";
            case VOICE_USE_VAD -> "Use Voice Activity";
            case PRIORITY_SPEAKER -> "Priority Speaker";
            case CREATE_PUBLIC_THREADS -> "Create Public Threads";
            case CREATE_PRIVATE_THREADS -> "Create Private Threads";
            case MESSAGE_EXT_STICKER -> "Use External Stickers";
            case MESSAGE_SEND_IN_THREADS -> "Send Messages in Threads";
            case USE_APPLICATION_COMMANDS -> "Use Application Commands";
            case REQUEST_TO_SPEAK -> "Request to Speak";
            case USE_EMBEDDED_ACTIVITIES -> "Use Embedded Activities";
            case VIEW_GUILD_INSIGHTS -> "View Guild Insights";
            default -> {
                String name = permission.getName();
                yield name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase().replace("_", " ");
            }
        };
    }
}