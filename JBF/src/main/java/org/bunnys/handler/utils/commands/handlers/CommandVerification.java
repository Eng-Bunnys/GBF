package org.bunnys.handler.utils.commands.handlers;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.exceptions.ErrorHandler;
import net.dv8tion.jda.api.requests.ErrorResponse;
import org.bunnys.handler.JBF;
import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.utils.handler.colors.ColorCodes;
import org.bunnys.handler.utils.handler.Emojis;
import org.bunnys.handler.utils.handler.logging.TimestampUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Handles validation and permission checks for executing message-based commands
 *
 * <p>
 * This utility class provides a clean separation between validation logic and
 * error presentation,
 * with comprehensive error handling and performance optimizations.
 * </p>
 */
@SuppressWarnings("unused")
public final class CommandVerification {
    private static final Logger logger = LoggerFactory.getLogger(CommandVerification.class);

    // Constants
    private static final int AUTO_DELETE_SECONDS = 5;
    private static final String PERMISSION_DELIMITER = ", ";

    // Error messages
    private static final String ERROR_DEV_ONLY = "Only **developers** can use this command.";
    private static final String ERROR_DM_NOT_SUPPORTED = "This command cannot be used outside of a server.";
    private static final String ERROR_USER_PERMISSIONS = "You are missing the following permissions:";
    private static final String ERROR_BOT_PERMISSIONS = "I am missing the following permissions:";
    private static final String ERROR_NSFW_ONLY = "This command can only be used in **Age-Restricted** channels.";

    // Titles
    private static final String TITLE_ACCESS_DENIED = "You cannot do that";
    private static final String TITLE_NOT_SUPPORTED = "Not Supported";
    private static final String TITLE_MISSING_PERMISSIONS = "Missing Permissions";
    private static final String TITLE_COOLDOWN_ACTIVE = "You can't use that yet";
    private static final String TITLE_NSFW_REQUIRED = "NSFW Command";

    private CommandVerification() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Validates if a command can be executed within the current context.
     *
     * @param client The bot client wrapper providing configuration and context
     * @param event  The triggering message event
     * @param config The command's execution configuration
     * @return A {@link ValidationResult} containing the outcome and any error
     *         details
     * @throws IllegalArgumentException if any parameter is null
     */
    public static ValidationResult validateExecution(JBF client, MessageReceivedEvent event,
            MessageCommandConfig config) {
        Objects.requireNonNull(client, "Client cannot be null");
        Objects.requireNonNull(event, "Event object cannot be null");
        Objects.requireNonNull(config, "Config cannot be null");

        // NSFW Validation
        if (config.NSFW() && event.getChannelType().isGuild() && !event.getChannel().asTextChannel().isNSFW())
            return ValidationResult.failure(
                    ValidationFailureType.NSFW_REQUIRED,
                    TITLE_NSFW_REQUIRED,
                    ERROR_NSFW_ONLY
            );

        // Check developer-only restriction
        if (config.devOnly() && !isDeveloper(client, event.getAuthor()))
            return ValidationResult.failure(
                    ValidationFailureType.DEVELOPER_ONLY,
                    TITLE_ACCESS_DENIED,
                    ERROR_DEV_ONLY);

        // Validate guild context
        Guild guild = event.getGuild();
        Member member = event.getMember();

        if (member == null)
            return ValidationResult.failure(
                    ValidationFailureType.INVALID_CONTEXT,
                    TITLE_NOT_SUPPORTED,
                    ERROR_DM_NOT_SUPPORTED);

        // Check user permissions
        ValidationResult userPermResult = validateMemberPermissions(
                member, config.userPermissions(),
                ValidationFailureType.INSUFFICIENT_USER_PERMISSIONS,
                ERROR_USER_PERMISSIONS);

        if (userPermResult.hasFailed())
            return userPermResult;

        // Check bot permissions
        ValidationResult botPermResult = validateMemberPermissions(
                guild.getSelfMember(), config.botPermissions(),
                ValidationFailureType.INSUFFICIENT_BOT_PERMISSIONS,
                ERROR_BOT_PERMISSIONS);

        if (botPermResult.hasFailed())
            return botPermResult;

        // Check cooldown
        ValidationResult cooldownResult = validateCooldown(event.getAuthor(), config);

        if (cooldownResult.hasFailed())
            return cooldownResult;

        return ValidationResult.success();
    }

    /**
     * Convenience method that validates execution and automatically sends error
     * messages if validation fails
     *
     * @param client The bot client wrapper
     * @param event  The message event
     * @param config The command configuration
     * @return {@code true} if validation passed, {@code false} otherwise
     */
    public static boolean canExecute(JBF client, MessageReceivedEvent event, MessageCommandConfig config) {
        ValidationResult result = validateExecution(client, event, config);

        if (result.hasFailed()) {
            handleValidationFailure(event, result);
            return false;
        }

        return true;
    }

    // --- Private validation methods ---

    private static boolean isDeveloper(JBF client, User user) {
        String[] developers = client.getConfig().developers();
        if (developers == null)
            return false;

        return Arrays.asList(developers).contains(user.getId());
    }

    private static ValidationResult validateMemberPermissions(Member member,
            Collection<Permission> requiredPermissions,
            ValidationFailureType failureType,
            String baseMessage) {
        if (requiredPermissions == null || requiredPermissions.isEmpty())
            return ValidationResult.success();

        List<Permission> missingPermissions = requiredPermissions.stream()
                .filter(permission -> !member.hasPermission(permission))
                .toList();

        if (!missingPermissions.isEmpty()) {
            String formattedPermissions = missingPermissions.stream()
                    .map(CommandVerification::formatPermissionName)
                    .collect(Collectors.joining(PERMISSION_DELIMITER));

            String description = baseMessage + "\n`" + formattedPermissions + "`";

            return ValidationResult.failure(failureType, TITLE_MISSING_PERMISSIONS, description);
        }

        return ValidationResult.success();
    }

    private static ValidationResult validateCooldown(User user, MessageCommandConfig config) {
        long cooldownMs = config.cooldown();
        if (cooldownMs <= 0)
            return ValidationResult.success();

        String userId = user.getId();
        String commandName = config.commandName();

        if (CooldownManager.isOnCooldown(commandName, userId, cooldownMs)) {
            long remainingMs = CooldownManager.getRemainingCooldown(commandName, userId);

            String dynamicTimestamp = TimestampUtils.getTimestamp(
                    new Date(System.currentTimeMillis() + remainingMs),
                    TimestampUtils.UnixFormat.R);

            String description = String.format(
                    "%s %s\nYou can use this command again %s.",
                    Emojis.DEFAULT_ERROR, TITLE_COOLDOWN_ACTIVE, dynamicTimestamp);

            return ValidationResult.cooldownFailure(TITLE_COOLDOWN_ACTIVE, description, remainingMs);
        }

        return ValidationResult.success();
    }

    private static String formatPermissionName(Permission permission) {
        return Arrays.stream(permission.getName().replace("_", " ").toLowerCase().split(" "))
                .map(word -> Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(Collectors.joining(" "));
    }

    // --- Error handling ---

    public static void handleValidationFailure(MessageReceivedEvent event, ValidationResult result) {
        if (result.getFailureType() == ValidationFailureType.COOLDOWN_ACTIVE)
            sendCooldownEmbed(event, result);
         else
            sendStandardErrorEmbed(event, result);
    }

    private static void sendStandardErrorEmbed(MessageReceivedEvent event, ValidationResult result) {
        EmbedBuilder embed = new EmbedBuilder()
                .setColor(ColorCodes.ERROR_RED)
                .setTitle(Emojis.DEFAULT_ERROR + " " + result.getTitle())
                .setDescription(result.getDescription());

        event.getChannel()
                .sendMessage(event.getAuthor().getAsMention())
                .setEmbeds(embed.build())
                .queue(
                        message -> message.delete().queueAfter(AUTO_DELETE_SECONDS, TimeUnit.SECONDS,
                                null, new ErrorHandler().ignore(ErrorResponse.UNKNOWN_MESSAGE)),
                        throwable -> logger.warn("Failed to send error message in channel {}: {}",
                                event.getChannel().getId(), throwable.getMessage()));
    }

    private static void sendCooldownEmbed(MessageReceivedEvent event, ValidationResult result) {
        long remainingMs = result.getCooldownRemainingMs();

        EmbedBuilder embed = new EmbedBuilder()
                .setColor(ColorCodes.ERROR_RED)
                .setDescription(result.getDescription())
                .setFooter("This message will auto-delete in " + (remainingMs / 1000) + "s");

        event.getChannel()
                .sendMessageEmbeds(embed.build())
                .queue(
                        message -> message.delete().queueAfter(remainingMs, TimeUnit.MILLISECONDS,
                                null, new ErrorHandler().ignore(ErrorResponse.UNKNOWN_MESSAGE)),
                        throwable -> logger.warn("Failed to send cooldown message in channel {}: {}",
                                event.getChannel().getId(), throwable.getMessage()));
    }

    // --- Validation Result Classes ---

    /**
     * Represents the result of a command validation operation
     */
    public static class ValidationResult {
        private final boolean success;
        private final ValidationFailureType failureType;
        private final String title;
        private final String description;
        private final long cooldownRemainingMs;

        private ValidationResult(boolean success, ValidationFailureType failureType,
                String title, String description, long cooldownRemainingMs) {
            this.success = success;
            this.failureType = failureType;
            this.title = title;
            this.description = description;
            this.cooldownRemainingMs = cooldownRemainingMs;
        }

        public static ValidationResult success() {
            return new ValidationResult(true, null, null, null, 0);
        }

        public static ValidationResult failure(ValidationFailureType type, String title, String description) {
            return new ValidationResult(false, type, title, description, 0);
        }

        public static ValidationResult cooldownFailure(String title, String description, long remainingMs) {
            return new ValidationResult(false, ValidationFailureType.COOLDOWN_ACTIVE,
                    title, description, remainingMs);
        }

        public boolean hasFailed() {
            return !success;
        }

        public ValidationFailureType getFailureType() {
            return failureType;
        }

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }

        public long getCooldownRemainingMs() {
            return cooldownRemainingMs;
        }
    }

    /**
     * Enumeration of possible validation failure types
     */
    public enum ValidationFailureType {
        DEVELOPER_ONLY,
        INVALID_CONTEXT,
        INSUFFICIENT_USER_PERMISSIONS,
        INSUFFICIENT_BOT_PERMISSIONS,
        COOLDOWN_ACTIVE,
        NSFW_REQUIRED
    }
}