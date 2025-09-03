package org.bunnys.handler.utils.commands.handlers;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.Permission;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.Member;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.exceptions.ErrorHandler;
import net.dv8tion.jda.api.requests.ErrorResponse;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.utils.handler.Emojis;
import org.bunnys.handler.utils.handler.colors.ColorCodes;
import org.bunnys.handler.utils.handler.logging.TimestampUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * <h1 id="commandverification-class">CommandVerification Class</h1>
 * <p>
 * A comprehensive utility class for validating command execution contexts
 * and permissions
 * </p>
 * <p>
 * This class provides a robust and reusable set of methods to verify
 * various conditions before a command is executed, such as user and bot
 * permissions, developer-only restrictions, channel context (NSFW), and
 * cooldown periods.
 * It encapsulates the validation logic and error
 * presentation, promoting a clean separation of concerns within the command
 * handling framework
 * </p>
 * <p>
 * Key features include:
 * <ul>
 * <li><b>Centralized Validation Logic:</b> All pre-execution checks are
 * consolidated into a single, static class</li>
 * <li><b>Rich Result Object:</b> The {@link ValidationResult} class
 * provides a detailed and type-safe way to communicate validation
 * outcomes, including failure types and descriptive messages.</li>
 * <li><b>Automatic Error Handling:</b> The {@link #canExecute(BunnyNexus,
 * MessageReceivedEvent, MessageCommandConfig)} method simplifies the
 * common use case of validating and automatically handling failures by
 * sending ephemeral error messages to the user</li>
 * <li><b>Performance and Scalability:</b> The use of static methods and
 * efficient stream-based operations ensures minimal overhead</li>
 * </ul>
 * </p>
 *
 * @author Bunny
 * @see BunnyNexus
 * @see MessageCommandConfig
 * @see CooldownManager
 */
@SuppressWarnings("unused")
public final class CommandVerification {
    /**
     * The logger instance for this class
     */
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

    /**
     * Private constructor to prevent instantiation
     * <p>
     * This class is a utility class containing only static methods
     * </p>
     *
     * @throws UnsupportedOperationException always
     */
    private CommandVerification() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * <h2 id="validateexecution">Validates Command Execution</h2>
     * <p>
     * Performs a series of sequential checks to determine if a command is
     * eligible for execution based on the provided event context and command
     * configuration
     * </p>
     * <p>
     * The validation flow is designed to be efficient, failing fast on the
     * first encountered error. The order of checks is:
     * <ol>
     * <li>NSFW channel context check.</li>
     * <li>Developer-only restriction check.</li>
     * <li>Guild (server) context check.</li>
     * <li>User permissions check.</li>
     * <li>Bot permissions check.</li>
     * <li>Command cooldown check.</li>
     * </ol>
     * </p>
     *
     * @param client The {@link BunnyNexus} bot client instance, providing access to
     *               configuration and global state
     * @param event  The {@link MessageReceivedEvent} that triggered the command.
     * @param config The {@link MessageCommandConfig} for the command being
     *               validated
     * @return A {@link ValidationResult} object indicating success or a specific
     *         type of failure
     * @throws IllegalArgumentException if {@code client}, {@code event}, or
     *                                  {@code config} is {@code null}
     */
    public static ValidationResult validateExecution(BunnyNexus client, MessageReceivedEvent event,
            MessageCommandConfig config) {
        Objects.requireNonNull(client, "Client cannot be null");
        Objects.requireNonNull(event, "Event object cannot be null");
        Objects.requireNonNull(config, "Config cannot be null");

        // NSFW Validation: Check if the command requires an age-restricted channel
        if (config.NSFW() && event.getChannelType().isGuild() && !event.getChannel().asTextChannel().isNSFW())
            return ValidationResult.failure(
                    ValidationFailureType.NSFW_REQUIRED,
                    TITLE_NSFW_REQUIRED,
                    ERROR_NSFW_ONLY);

        // Check developer-only restriction: Prevents unauthorized users from running
        // dev-only commands
        if (config.devOnly() && !isDeveloper(client, event.getAuthor()))
            return ValidationResult.failure(
                    ValidationFailureType.DEVELOPER_ONLY,
                    TITLE_ACCESS_DENIED,
                    ERROR_DEV_ONLY);

        // Validate guild context: Ensures the command is not used in a Direct Message
        Guild guild = event.getGuild();
        Member member = event.getMember();

        if (member == null)
            return ValidationResult.failure(
                    ValidationFailureType.INVALID_CONTEXT,
                    TITLE_NOT_SUPPORTED,
                    ERROR_DM_NOT_SUPPORTED);

        // Check user permissions: Verifies if the user has all required permissions
        ValidationResult userPermResult = validateMemberPermissions(
                member, config.userPermissions(),
                ValidationFailureType.INSUFFICIENT_USER_PERMISSIONS,
                ERROR_USER_PERMISSIONS);

        if (userPermResult.hasFailed())
            return userPermResult;

        // Check bot permissions: Ensures the bot has all necessary permissions to
        // function correctly
        ValidationResult botPermResult = validateMemberPermissions(
                guild.getSelfMember(), config.botPermissions(),
                ValidationFailureType.INSUFFICIENT_BOT_PERMISSIONS,
                ERROR_BOT_PERMISSIONS);

        if (botPermResult.hasFailed())
            return botPermResult;

        // Check cooldown: Prevents command spam and abuse
        ValidationResult cooldownResult = validateCooldown(event.getAuthor(), config);

        if (cooldownResult.hasFailed())
            return cooldownResult;

        return ValidationResult.success();
    }

    /**
     * <h2 id="canexecute">Checks and Handles Execution</h2>
     * <p>
     * A convenience method that wraps {@link #validateExecution(BunnyNexus,
     * MessageReceivedEvent, MessageCommandConfig)}. If validation fails, it
     * automatically calls {@link #handleValidationFailure(MessageReceivedEvent,
     * ValidationResult)} to send an informative, auto-deleting error message to
     * the user
     * </p>
     *
     * @param client The bot client wrapper
     * @param event  The message event
     * @param config The command configuration
     * @return {@code true} if all validation checks passed; {@code false} otherwise
     */
    public static boolean canExecute(BunnyNexus client, MessageReceivedEvent event, MessageCommandConfig config) {
        ValidationResult result = validateExecution(client, event, config);

        if (result.hasFailed()) {
            handleValidationFailure(event, result);
            return false;
        }

        return true;
    }

    // --- Private validation methods ---

    /**
     * <h3 id="isdeveloper">Checks if a user is a registered developer</h3>
     * <p>
     * Compares the user's ID against the list of developer IDs
     * configured in the bot's settings
     * </p>
     *
     * @param client The bot client wrapper
     * @param user   The user to check
     * @return {@code true} if the user is a developer; {@code false} otherwise
     */
    private static boolean isDeveloper(BunnyNexus client, User user) {
        String[] developers = client.getConfig().developers();
        if (developers == null)
            return false;

        return Arrays.asList(developers).contains(user.getId());
    }

    /**
     * <h3 id="validatememberpermissions">Validates a member's permissions</h3>
     * <p>
     * Checks if a given {@link Member} has all the required permissions.
     * This method is used for both users and the bot itself (via
     * {@link Guild#getSelfMember()})
     * </p>
     *
     * @param member              The {@link Member} whose permissions are being
     *                            checked
     * @param requiredPermissions A collection of {@link Permission} objects that
     *                            the
     *                            member must have
     * @param failureType         The type of failure to return if permissions are
     *                            missing
     * @param baseMessage         The base error message for the failure
     * @return A {@link ValidationResult} indicating success or failure with a list
     *         of missing permissions
     */
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

    /**
     * <h3 id="validatecooldown">Validates command cooldown</h3>
     * <p>
     * Checks if a user is on cooldown for a specific command.
     * This prevents
     * rapid successive use of a command, which helps to mitigate spam or
     * API rate limits
     * </p>
     *
     * @param user   The user to check
     * @param config The command configuration, which contains the cooldown duration
     * @return A {@link ValidationResult} indicating success or a cooldown failure
     *         with the remaining time
     * @see CooldownManager
     */
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

    /**
     * <h3 id="formatpermissionname">Formats a permission name</h3>
     * <p>
     * Converts a JDA {@link Permission} enum name (e.g., {@code MANAGE_CHANNEL})
     * into a more human-readable format (e.g., "Manage Channel")
     * </p>
     *
     * @param permission The permission to format
     * @return The formatted permission name string
     */
    private static String formatPermissionName(Permission permission) {
        return Arrays.stream(permission.getName().replace("_", " ").toLowerCase().split(" "))
                .map(word -> Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(Collectors.joining(" "));
    }

    // --- Error handling ---

    /**
     * <h2 id="handlevalidationfailure">Handles a validation failure</h2>
     * <p>
     * Dispatches the validation failure to the appropriate error-sending
     * method based on the type of failure (e.g., a cooldown-specific embed or
     * a standard error embed)
     * </p>
     *
     * @param event  The message event
     * @param result The {@link ValidationResult} containing the failure details
     */
    public static void handleValidationFailure(MessageReceivedEvent event, ValidationResult result) {
        if (result.getFailureType() == ValidationFailureType.COOLDOWN_ACTIVE)
            sendCooldownEmbed(event, result);
        else
            sendStandardErrorEmbed(event, result);
    }

    /**
     * <h3 id="sendstandarderrorembed">Sends a standard error embed</h3>
     * <p>
     * Constructs and sends a generic error embed with a title and description
     * The message is automatically deleted after a fixed duration
     * </p>
     *
     * @param event  The message event
     * @param result The validation result containing the error details
     */
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

    /**
     * <h3 id="sendcooldownembed">Sends a cooldown-specific error embed</h3>
     * <p>
     * Constructs and sends a specialized error embed for cooldowns
     * The
     * message's auto-delete duration is dynamically set to match the remaining
     * cooldown time
     * </p>
     *
     * @param event  The message event
     * @param result The validation result containing the cooldown details
     */
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
     * <h2 id="validationresult">Represents the result of a validation
     * operation</h2>
     * <p>
     * A simple, immutable record-like class that encapsulates the outcome of a
     * command validation check. It provides a clean, type-safe way to pass
     * success or failure states, along with any relevant error details
     * </p>
     */
    public static class ValidationResult {
        private final boolean success;
        private final ValidationFailureType failureType;
        private final String title;
        private final String description;
        private final long cooldownRemainingMs;

        /**
         * Private constructor to enforce factory methods for instantiation
         *
         * @param success             A boolean indicating if the validation was
         *                            successful
         * @param failureType         The type of failure, if any
         * @param title               The title for the error message
         * @param description         The detailed description for the error message
         * @param cooldownRemainingMs The remaining cooldown time in milliseconds, for
         *                            cooldown failures
         */
        private ValidationResult(boolean success, ValidationFailureType failureType,
                String title, String description, long cooldownRemainingMs) {
            this.success = success;
            this.failureType = failureType;
            this.title = title;
            this.description = description;
            this.cooldownRemainingMs = cooldownRemainingMs;
        }

        /**
         * Creates a new {@code ValidationResult} for a successful validation
         *
         * @return A success result instance
         */
        public static ValidationResult success() {
            return new ValidationResult(true, null, null, null, 0);
        }

        /**
         * Creates a new {@code ValidationResult} for a generic failure
         *
         * @param type        The specific type of validation failure
         * @param title       The title for the error message
         * @param description The detailed description for the error message
         * @return A failure result instance
         */
        public static ValidationResult failure(ValidationFailureType type, String title, String description) {
            return new ValidationResult(false, type, title, description, 0);
        }

        /**
         * Creates a new {@code ValidationResult} for a cooldown-specific failure
         *
         * @param title       The title for the error message
         * @param description The detailed description for the error message
         * @param remainingMs The remaining cooldown time in milliseconds
         * @return A cooldown failure result instance
         */
        public static ValidationResult cooldownFailure(String title, String description, long remainingMs) {
            return new ValidationResult(false, ValidationFailureType.COOLDOWN_ACTIVE,
                    title, description, remainingMs);
        }

        /**
         * Checks if the validation failed
         *
         * @return {@code true} if validation failed; {@code false} if it succeeded
         */
        public boolean hasFailed() {
            return !success;
        }

        /**
         * Gets the specific type of validation failure
         *
         * @return The {@link ValidationFailureType}.
         *         Will be {@code null} if validation
         *         succeeded
         */
        public ValidationFailureType getFailureType() {
            return failureType;
        }

        /**
         * Gets the title of the error message
         *
         * @return The error title. Will be {@code null} if validation succeeded.
         */
        public String getTitle() {
            return title;
        }

        /**
         * Gets the detailed description of the error
         *
         * @return The error description. Will be {@code null} if validation succeeded
         */
        public String getDescription() {
            return description;
        }

        /**
         * Gets the remaining cooldown time in milliseconds
         *
         * @return The remaining cooldown time, or 0 if not a cooldown failure
         */
        public long getCooldownRemainingMs() {
            return cooldownRemainingMs;
        }
    }

    /**
     * <h2 id="validationfailuretype">Enumeration of possible failure types</h2>
     * <p>
     * Defines the distinct reasons why a command validation might fail
     * Using an enum provides a clear, type-safe way to categorize
     * errors
     * </p>
     */
    public enum ValidationFailureType {
        /**
         * Command is restricted to developers only
         */
        DEVELOPER_ONLY,
        /**
         * Command cannot be used in the current context (e.g., in a DM)
         */
        INVALID_CONTEXT,
        /**
         * The user lacks the necessary permissions
         */
        INSUFFICIENT_USER_PERMISSIONS,
        /**
         * The bot lacks the necessary permissions
         */
        INSUFFICIENT_BOT_PERMISSIONS,
        /**
         * The command is currently on cooldown for the user
         */
        COOLDOWN_ACTIVE,
        /**
         * The command requires an age-restricted (NSFW) channel
         */
        NSFW_REQUIRED
    }
}