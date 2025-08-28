package org.bunnys.handler.utils.commands.handlers;

import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import org.bunnys.handler.JBF;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.utils.handler.logging.Logger;
import org.bunnys.handler.utils.handler.logging.TimestampUtils;

import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

public class MessageCommandParser {
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");
    private static final String PARSER_NAME = "MessageCommandParser";

    // Rate limiting settings
    private static final long RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
    private static final int RATE_LIMIT_MAX_ATTEMPTS = 30; // 30 per minute per user
    private static final ConcurrentHashMap<String, UserRateLimit> userRateLimits = new ConcurrentHashMap<>();

    public record ParseResult(MessageCommand command,
            String commandName,
            String[] args,
            MessageCommandConfig commandConfig) {
    }

    private static class UserRateLimit {
        private long windowStart;
        private int attempts;

        UserRateLimit() {
            this.windowStart = System.currentTimeMillis();
            this.attempts = 1;
        }

        boolean isRateLimited() {
            long currentTime = System.currentTimeMillis();

            // Reset window if expired
            if (currentTime - windowStart > RATE_LIMIT_WINDOW_MS) {
                windowStart = currentTime;
                attempts = 1;
                return false;
            }

            attempts++;
            return attempts > RATE_LIMIT_MAX_ATTEMPTS;
        }

        long getRemainingTime() {
            return RATE_LIMIT_WINDOW_MS - (System.currentTimeMillis() - windowStart);
        }
    }

    public static ParseResult parse(JBF client, MessageReceivedEvent event) {
        if (!shouldProcessMessage(event))
            return null;

        return parseCommandStructure(client, event);
    }

    private static boolean shouldProcessMessage(MessageReceivedEvent event) {
        User author = event.getAuthor();

        // Filter bots, webhooks, and system messages
        return !(author.isBot() || event.isWebhookMessage() || author.isSystem());
    }

    private static ParseResult parseCommandStructure(JBF client, MessageReceivedEvent event) {
        try {
            String prefix = client.getConfig().prefix();
            String rawContent = event.getMessage().getContentRaw();

            if (!rawContent.startsWith(prefix))
                return null;

            // Split command and arguments
            String[] parts = WHITESPACE_PATTERN.split(rawContent.substring(prefix.length()).trim());
            if (parts.length == 0)
                return null;

            String commandName = parts[0].toLowerCase();
            String[] args = parts.length > 1 ? java.util.Arrays.copyOfRange(parts, 1, parts.length) : new String[0];

            CommandRegistry.CommandEntry entry = client.commandRegistry().findMessage(commandName);
            if (entry == null)
                return null;

            if (isUserRateLimited(event.getAuthor())) {
                long remainingMs = getRemainingCooldown(event.getAuthor());

                event.getChannel().sendMessage(
                        event.getAuthor().getAsMention() + " you are being rate limited. Try again "
                                + String.format("<t:%d:R>", TimestampUtils.getFutureUnixTimestamp(remainingMs / 1000)))
                        .queue(msg -> msg.delete().queueAfter(5, java.util.concurrent.TimeUnit.SECONDS));

                return null;
            }

            return new ParseResult(
                    entry.messageCommand(),
                    commandName,
                    args,
                    entry.messageMetaData());

        } catch (Exception e) {
            Logger.error("[" + PARSER_NAME + "] Failed to parse command from message in channel "
                    + event.getChannel().getId() + ": " + e.getMessage());
            return null;
        }
    }

    private static boolean isUserRateLimited(User user) {
        String userId = user.getId();

        UserRateLimit rateLimit = userRateLimits.compute(userId, (key, existing) -> {
            if (existing == null)
                return new UserRateLimit();
            return existing;
        });

        return rateLimit.isRateLimited();
    }

    private static long getRemainingCooldown(User user) {
        UserRateLimit rateLimit = userRateLimits.get(user.getId());
        return (rateLimit != null) ? rateLimit.getRemainingTime() : 0;
    }

    public static int getRateLimitedUserCount() {
        long currentTime = System.currentTimeMillis();
        userRateLimits.entrySet()
                .removeIf(entry -> currentTime - entry.getValue().windowStart > RATE_LIMIT_WINDOW_MS * 2);

        return userRateLimits.size();
    }

    public static void clearRateLimits() {
        userRateLimits.clear();
    }
}
