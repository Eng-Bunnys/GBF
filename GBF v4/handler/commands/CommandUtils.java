package org.bunnys.handler.commands;

import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.UserSnowflake;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.entities.channel.middleman.GuildChannel;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
import net.dv8tion.jda.api.utils.messages.MessageCreateData;
import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.message.config.MessageCommandConfig;
import org.bunnys.handler.utils.TimestampUtils;
import org.bunnys.utils.Utils;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class CommandUtils {
    private static final Map<String, Map<String, Long>> commandCooldowns = new ConcurrentHashMap<>();
    private static final ScheduledExecutorService cleanupScheduler = new ScheduledThreadPoolExecutor(1);
    private static final long MAX_COOLDOWN = 3600;
    private static final long MIN_COOLDOWN = 1;
    private static final long DEFAULT_DELAY = 5;

    public static boolean validateNSFW(MessageCommandConfig options, MessageChannel channel, String userMention) {
        if (!options.isNSFW())
            return true;

        if (!(channel instanceof TextChannel) || !((TextChannel) channel).isNSFW()) {
            Utils.sendAndDelete(channel,
                    MessageCreateData.fromContent(userMention + ", this command requires an NSFW channel"),
                    DEFAULT_DELAY);
            return false;
        }
        return true;
    }

    public static boolean validateDeveloperOnly(GBF client, MessageCommandConfig options, MessageChannel channel, String userId, String userMention) {
        if (!options.isDeveloperOnly())
            return true;

        if (!client.getConfig().Developers().contains(UserSnowflake.fromId(userId))) {
            Utils.sendAndDelete(channel,
                    MessageCreateData.fromContent(userMention + ", this command is restricted to developers"),
                    DEFAULT_DELAY);
            return false;
        }
        return true;
    }

    public static boolean validateCooldown(GBF client, MessageCommandConfig options, String commandName, MessageChannel channel, String userId, String userMention) {
        float cooldown = options.getCooldown();
        if (cooldown <= 0 || client.getConfig().Developers().contains(UserSnowflake.fromId(userId)))
            return true;

        long safeCooldown = Math.max(MIN_COOLDOWN, Math.min(MAX_COOLDOWN, (long) cooldown));
        Map<String, Long> userTimestamps = commandCooldowns.computeIfAbsent(commandName, k -> new ConcurrentHashMap<>());
        long currentTime = System.currentTimeMillis();
        long cooldownMillis = safeCooldown * 1000;

        Long lastUsed = userTimestamps.get(userId);
        if (lastUsed != null && currentTime < lastUsed + cooldownMillis) {
            long remainingTimeSeconds = (lastUsed + cooldownMillis - currentTime + 999) / 1000;
            String formattedTimestamp = TimestampUtils.getTimestamp(
                    new java.util.Date(lastUsed + cooldownMillis), TimestampUtils.UnixFormat.R);
            Utils.sendAndDelete(channel,
                    MessageCreateData.fromContent(
                            userMention + ", you can use '" + commandName + "' " + formattedTimestamp),
                    remainingTimeSeconds);
            return false;
        }

        userTimestamps.put(userId, currentTime);
        cleanupScheduler.schedule(() -> userTimestamps.remove(userId), safeCooldown, TimeUnit.SECONDS);
        return true;
    }

    /**
     * @inverted Returns false if the member has all required permissions, to use check if true
     */
    public static boolean hasRequiredPermissions(Member member, MessageChannel channel, Set<Permission> requiredPermissions, String errorMessagePrefix) {
        if (requiredPermissions.isEmpty() || member == null || channel == null)
            return false;

        Set<Permission> memberPermissions = member.getPermissions((GuildChannel) channel);
        if (memberPermissions.containsAll(requiredPermissions))
            return false;

        String readablePerms = requiredPermissions.stream()
                .filter(perm -> !memberPermissions.contains(perm))
                .map(perm -> Utils.toTitleCase(perm.getName()))
                .collect(Collectors.joining(", "));
        Utils.sendAndDelete(channel, MessageCreateData.fromContent(errorMessagePrefix + readablePerms), DEFAULT_DELAY);
        return true;
    }
}