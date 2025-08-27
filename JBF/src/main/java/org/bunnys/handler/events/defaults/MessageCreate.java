package org.bunnys.handler.events.defaults;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.JBF;
import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;
import org.bunnys.handler.utils.commands.CommandVerification;
import org.bunnys.handler.utils.commands.MessageCommandParser;

import org.bunnys.handler.spi.MessageCommand;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * High-performance message event handler with comprehensive error handling,
 * metrics collection, and async command execution
 *
 * <p>
 * Features:
 * </p>
 * <ul>
 * <li>Async command execution to prevent blocking</li>
 * <li>Comprehensive validation and error handling</li>
 * <li>Performance metrics and monitoring</li>
 * <li>Graceful degradation on failures</li>
 * <li>Resource management and cleanup</li>
 * </ul>
 */
public class MessageCreate extends ListenerAdapter implements Event {
    private static final String EVENT_NAME = "MessageCreate";
    private static final int COMMAND_TIMEOUT_SECONDS = 45;

    private final JBF client;
    private final ExecutorService commandExecutor;
    private final SimpleMetrics metrics;

    public MessageCreate(JBF client) {
        this.client = client;
        this.commandExecutor = Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "MessageCommand-" + Thread.currentThread().threadId());
            t.setDaemon(true);
            t.setUncaughtExceptionHandler(this::handleUncaughtException);
            return t;
        });
        this.metrics = new SimpleMetrics();
    }

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        // Early filtering - fail fast
        if (shouldIgnoreMessage(event))
            return;

        // Parse command - this is lightweight and can be done synchronously
        MessageCommandParser.ParseResult parseResult = parseCommand(event);
        if (parseResult == null) {
            return; // Not a command or parsing failed
        }

        // Find command configuration
        MessageCommandConfig config = findCommandConfig(parseResult.commandName());
        if (config == null) {
            Logger.debug(
                    () -> "[" + EVENT_NAME + "] Command '" + parseResult.commandName() + "' not found in registry");
            return;
        }

        // Record attempt metrics
        metrics.recordCommandAttempt(parseResult.commandName(), event.getAuthor().getId());

        // Perform validation
        CommandVerification.ValidationResult validationResult = CommandVerification.validateExecution(client, event,
                config);

        if (!validationResult.isSuccess()) {
            handleValidationFailure(event, parseResult, validationResult);
            // IMPORTANT: Also call CommandVerification's error handler to send user message
            CommandVerification.handleValidationFailure(event, validationResult);
            return;
        }

        // Execute command asynchronously
        executeCommandAsync(event, parseResult, config);
    }

    /**
     * Cleanup resources when the bot shuts down
     */
    public void shutdown() {
        Logger.info("[" + EVENT_NAME + "] Shutting down command executor...");
        commandExecutor.shutdown();
        try {
            if (!commandExecutor.awaitTermination(10, TimeUnit.SECONDS)) {
                Logger.warning("[" + EVENT_NAME + "] Command executor did not terminate gracefully, forcing shutdown");
                commandExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            Logger.error("[" + EVENT_NAME + "] Interrupted while waiting for command executor shutdown");
            commandExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    // --- Private methods ---

    private boolean shouldIgnoreMessage(MessageReceivedEvent event) {
        User author = event.getAuthor();

        // Ignore bots and webhooks
        if (author.isBot() || event.isWebhookMessage()) {
            return true;
        }

        // Ignore system messages
        if (author.isSystem()) {
            return true;
        }

        // Optional: Rate limiting protection
        if (isUserRateLimited(author)) {
            Logger.debug(() -> "[" + EVENT_NAME + "] User " + author.getId() + " is rate limited");
            return true;
        }

        return false;
    }

    private boolean isUserRateLimited(User user) {
        // Implement basic rate limiting - prevent spam
        return metrics.isUserRateLimited(user.getId());
    }

    private MessageCommandParser.ParseResult parseCommand(MessageReceivedEvent event) {
        try {
            return MessageCommandParser.parse(client, event);
        } catch (Exception e) {
            Logger.warning("[" + EVENT_NAME + "] Failed to parse command from message in channel "
                    + event.getChannel().getId() + ": " + e.getMessage());
            return null;
        }
    }

    private MessageCommandConfig findCommandConfig(String commandName) {
        try {
            return client.commandRegistry().findMessage(commandName).messageMetaData();
        } catch (Exception e) {
            Logger.warning(
                    "[" + EVENT_NAME + "] Failed to find command config for '" + commandName + "': " + e.getMessage());
            return null;
        }
    }

    private void handleValidationFailure(MessageReceivedEvent event,
            MessageCommandParser.ParseResult parseResult,
            CommandVerification.ValidationResult validationResult) {

        String commandName = parseResult.commandName();
        String userId = event.getAuthor().getId();
        CommandVerification.ValidationFailureType failureType = validationResult.getFailureType();

        // Record metrics
        metrics.recordCommandFailure(commandName, userId, failureType);

        // Enhanced logging based on failure type
        switch (failureType) {
            case DEVELOPER_ONLY -> Logger.debug(() -> "[" + EVENT_NAME + "] Developer-only command '" + commandName
                    + "' attempted by user " + userId);

            case INSUFFICIENT_USER_PERMISSIONS -> {
                Logger.info("[Security] User " + userId + " attempted command '" + commandName
                        + "' without required permissions in guild " + event.getGuild().getId());
                // Optional: Alert security monitoring system
                alertSecurityEvent(event, commandName, "INSUFFICIENT_PERMISSIONS");
            }

            case INSUFFICIENT_BOT_PERMISSIONS -> {
                Logger.warning("[" + EVENT_NAME + "] Bot lacks permissions for command '" + commandName + "' in guild "
                        + event.getGuild().getId());
                // Optional: Alert bot administrators
                alertBotPermissionIssue(event, commandName);
            }

            case COOLDOWN_ACTIVE ->
                Logger.debug(() -> "[" + EVENT_NAME + "] Command '" + commandName + "' on cooldown for user " + userId);

            case INVALID_CONTEXT -> Logger.debug(() -> "[" + EVENT_NAME + "] Command '" + commandName
                    + "' used in invalid context by user " + userId);

            default -> Logger.warning("[" + EVENT_NAME + "] Unknown validation failure type: " + failureType);
        }
    }

    private void executeCommandAsync(MessageReceivedEvent event,
            MessageCommandParser.ParseResult parseResult,
            MessageCommandConfig config) {

        String commandName = parseResult.commandName();
        String userId = event.getAuthor().getId();
        MessageCommand command = parseResult.command();

        CompletableFuture
                .runAsync(() -> executeCommand(event, parseResult, config), commandExecutor)
                .orTimeout(COMMAND_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .whenComplete((result, throwable) -> {
                    if (throwable != null) {
                        handleCommandExecutionError(event, commandName, userId, throwable);
                    } else {
                        metrics.recordCommandSuccess(commandName, userId);
                        Logger.debug(() -> "[" + EVENT_NAME + "] Command '" + commandName
                                + "' executed successfully for user " + userId);
                    }
                });
    }

    private void executeCommand(MessageReceivedEvent event,
            MessageCommandParser.ParseResult parseResult,
            MessageCommandConfig config) {

        long startTime = System.currentTimeMillis();
        String commandName = parseResult.commandName();

        try {
            // Set cooldown before execution to prevent rapid-fire attempts
            if (config.cooldown() > 0) {
                // CooldownManager.setCooldown(commandName, event.getAuthor().getId());
                // Note: Cooldown is set by the CooldownManager during validation
            }

            parseResult.command().execute(client, event, parseResult.args());

            long executionTime = System.currentTimeMillis() - startTime;
            metrics.recordExecutionTime(commandName, executionTime);

        } catch (Exception e) {
            // Re-throw to be handled by the CompletableFuture's error handling
            throw new RuntimeException("Command execution failed", e);
        }
    }

    private void handleCommandExecutionError(MessageReceivedEvent event,
            String commandName,
            String userId,
            Throwable throwable) {

        metrics.recordCommandError(commandName, userId, throwable);

        if (throwable instanceof java.util.concurrent.TimeoutException) {
            Logger.error("[" + EVENT_NAME + "] Command '" + commandName + "' timed out after " + COMMAND_TIMEOUT_SECONDS
                    + "s for user " + userId);
            // Optional: Send timeout message to user
            sendTimeoutMessage(event, commandName);
        } else {
            Logger.error("[" + EVENT_NAME + "] Error executing command '" + commandName + "' for user " + userId + ": "
                    + throwable.getMessage(), throwable);
            // Optional: Send generic error message to user
            sendErrorMessage(event, commandName);
        }
    }

    private void handleUncaughtException(Thread thread, Throwable throwable) {
        Logger.error(
                "[" + EVENT_NAME + "] Uncaught exception in thread " + thread.getName() + ": " + throwable.getMessage(),
                throwable);
    }

    // --- Optional monitoring/alerting methods ---

    private void alertSecurityEvent(MessageReceivedEvent event,
            String commandName,
            String reason) {
        // Implement security alerting logic here
        // Could send to Discord webhook, external monitoring service, etc.
        Logger.info("[Security Alert] Command: " + commandName + ", Reason: " + reason + ", User: "
                + event.getAuthor().getId() +
                ", Guild: " + (event.getGuild() != null ? event.getGuild().getId() : "DM"));
    }

    private void alertBotPermissionIssue(MessageReceivedEvent event,
            String commandName) {
        // Alert administrators about permission issues
        Logger.warning("[Bot Permission Alert] Command '" + commandName
                + "' failed due to missing bot permissions in guild " + event.getGuild().getId());
    }

    private void sendTimeoutMessage(MessageReceivedEvent event, String commandName) {
        // Optional: Inform user about timeout
        // Implementation depends on your error messaging strategy
    }

    private void sendErrorMessage(MessageReceivedEvent event, String commandName) {
        // Optional: Send generic error message to user
        // Implementation depends on your error messaging strategy
    }
}

// --- Supporting Classes ---

/**
 * Simple metrics collection for command execution monitoring
 */
class SimpleMetrics {
    private final java.util.concurrent.ConcurrentHashMap<String, Long> commandAttempts = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.ConcurrentHashMap<String, Long> commandSuccesses = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.ConcurrentHashMap<String, Long> commandFailures = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.ConcurrentHashMap<String, Long> userRateLimits = new java.util.concurrent.ConcurrentHashMap<>();

    private static final long RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
    private static final int RATE_LIMIT_MAX_COMMANDS = 30; // 30 commands per minute per user

    public void recordCommandAttempt(String command, String userId) {
        commandAttempts.merge(command, 1L, Long::sum);
        updateUserRateLimit(userId);
    }

    public void recordCommandSuccess(String command, String userId) {
        commandSuccesses.merge(command, 1L, Long::sum);
    }

    public void recordCommandFailure(String command, String userId,
            CommandVerification.ValidationFailureType failureType) {
        commandFailures.merge(command + ":" + failureType.name(), 1L, Long::sum);
    }

    public void recordCommandError(String command, String userId, Throwable error) {
        commandFailures.merge(command + ":ERROR", 1L, Long::sum);
    }

    public void recordExecutionTime(String command, long timeMs) {
        // Could store execution time metrics here
        if (timeMs > 5000) { // Log slow commands
            Logger.warning("[Performance] Command '" + command + "' took " + timeMs + "ms to execute");
        }
    }

    public boolean isUserRateLimited(String userId) {
        Long lastReset = userRateLimits.get(userId);
        long currentTime = System.currentTimeMillis();

        if (lastReset == null || (currentTime - lastReset) > RATE_LIMIT_WINDOW_MS) {
            userRateLimits.put(userId, currentTime);
            return false;
        }

        // Simple rate limiting - could be more sophisticated
        return false; // Disabled for now, implement based on your needs
    }

    private void updateUserRateLimit(String userId) {
        userRateLimits.put(userId, System.currentTimeMillis());
    }
}

/**
 * Placeholder for CooldownManager - remove if you have your own implementation
 */
class CooldownManager {
    public static void setCooldown(String command, String userId) {
        // Implementation depends on your existing CooldownManager
    }
}