package org.bunnys.handler.events.defaults;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.commands.slash.SlashCommandConfig;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.spi.SlashCommand;
import org.bunnys.handler.utils.commands.handlers.CommandVerification;
import org.bunnys.handler.utils.commands.metrics.CommandMetrics;
import org.bunnys.handler.utils.handler.Emojis;
import org.bunnys.handler.utils.handler.colors.ColorCodes;
import org.bunnys.handler.utils.handler.logging.Logger;
import org.jetbrains.annotations.NotNull;

import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Event listener for handling slash command interactions
 * <p>
 * This class serves as the primary gateway for processing all incoming
 * {@link SlashCommandInteractionEvent}s. It manages the lifecycle of a
 * command execution, from initial validation to asynchronous execution,
 * timeout handling, and comprehensive error reporting
 * <p>
 * The key features of this handler include:
 * <ul>
 * <li><b>Asynchronous Execution:</b> Commands are executed on a dedicated
 * thread pool to avoid blocking the main JDA event loop, ensuring the bot
 * remains responsive.</li>
 * <li><b>Validation and Verification:</b> Pre-execution checks are performed
 * using {@link CommandVerification} to handle common failures, such as
 * cooldowns or permission issues, before a command is run.</li>
 * <li><b>Timeout Handling:</b> A fixed timeout is applied to each command
 * execution via {@link CompletableFuture#orTimeout(long, TimeUnit)} to prevent
 * long-running or stalled commands from consuming resources indefinitely.</li>
 * <li><b>Metrics Integration:</b> Detailed metrics are captured for command
 * attempts, successes, failures, and execution times using the
 * {@link CommandMetrics} class.</li>
 * <li><b>Robust Error Handling:</b> A centralized error handler provides
 * user-friendly feedback for both execution errors and timeouts, logging
 * detailed information for debugging with a unique trace ID.</li>
 * </ul>
 * This design promotes a scalable, reliable, and observable command handling
 * system, which is crucial for
 * production-level applications
 *
 * @author Bunny
 * @see net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent
 * @see org.bunnys.handler.spi.SlashCommand
 * @see org.bunnys.handler.utils.commands.metrics.CommandMetrics
 */
@SuppressWarnings("unused")
public class InteractionCreate extends ListenerAdapter implements Event {
    /**
     * The name of the event handled by this listener, used primarily for logging
     */
    private static final String EVENT_NAME = "InteractionCreate";
    /**
     * The maximum time a command is allowed to execute before being canceled, in
     * seconds
     */
    private static final int COMMAND_TIMEOUT_SECONDS = 30;
    /**
     * A counter for naming threads in the command execution thread pool
     */
    private static final AtomicInteger THREAD_SEQ = new AtomicInteger(1);

    /**
     * The main client instance, providing access to shared services like the
     * command registry
     */
    private final BunnyNexus client;
    /**
     * An {@link ExecutorService} for running commands asynchronously. A cached
     * thread pool is used
     * to efficiently reuse threads for command execution
     */
    private final ExecutorService commandExecutor;
    /**
     * An instance of {@link CommandMetrics} for recording and tracking
     * command-related performance and usage data
     */
    private final CommandMetrics metrics;

    /**
     * Constructs a new {@code InteractionCreate} event listener
     *
     * @param client The {@link BunnyNexus} client instance. Must not be null
     * @throws NullPointerException if the client is null
     */
    public InteractionCreate(BunnyNexus client) {
        this.client = Objects.requireNonNull(client, "client");
        this.commandExecutor = Executors.newCachedThreadPool(slashCommandThreadFactory());
        this.metrics = new CommandMetrics();
    }

    /**
     * Registers this listener with the provided JDA instance, enabling it to
     * receive events
     *
     * @param jda The JDA instance to which this listener will be added. Must not be
     *            null
     * @see net.dv8tion.jda.api.JDA#addEventListener(Object...)
     */
    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    /**
     * Handles an incoming slash command interaction event.
     * <p>
     * This method is the entry point for all slash commands. It performs the
     * following steps:
     * <ol>
     * <li>Looks up the command in the client's registry.</li>
     * <li>Records a command attempt metric.</li>
     * <li>Validates the command's execution context (e.g., permissions,
     * cooldowns).</li>
     * <li>If validation fails, records a failure metric and handles the
     * response.</li>
     * <li>If validation passes, it submits the command for asynchronous execution
     * on the dedicated thread pool.</li>
     * <li>Applies a timeout to the execution to prevent resource exhaustion.</li>
     * <li>Handles the outcome of the {@link CompletableFuture} (success, timeout,
     * or error), recording the appropriate metrics and providing user
     * feedback.</li>
     * </ol>
     *
     * @param event The {@link SlashCommandInteractionEvent} representing the user's
     *              interaction. Must not be null.
     */
    @Override
    public void onSlashCommandInteraction(@NotNull SlashCommandInteractionEvent event) {
        final String cmd = event.getName();
        final String userId = event.getUser().getId();

        CommandRegistry.CommandEntry entry = client.commandRegistry().findSlash(cmd);

        if (entry == null || entry.slashCommand() == null)
            return;

        final SlashCommand command = entry.slashCommand();
        final SlashCommandConfig config = command.initAndGetConfig();

        // Metrics: attempt
        metrics.recordCommandAttempt(cmd, userId);

        // Validate execution context
        CommandVerification.ValidationResult validation = CommandVerification.validateExecution(client, event, config);

        if (validation.hasFailed()) {
            metrics.recordCommandFailure(cmd, userId, validation.getFailureType());
            CommandVerification.handleValidationFailure(event, validation);
            return;
        }

        // Correlate logs with a short trace id
        final String traceId = shortTraceId();

        CompletableFuture
                .runAsync(() -> runCommand(event, command, config, traceId), commandExecutor)
                .orTimeout(COMMAND_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .whenComplete((ignored, ex) -> {
                    if (ex != null) {
                        metrics.recordCommandError(cmd, userId, ex);
                        handleError(event, cmd, userId, traceId, unwrapCompletion(ex));
                    } else {
                        metrics.recordCommandSuccess(cmd, userId);
                        Logger.info("[" + EVENT_NAME + "] Slash command '/" + cmd + "' completed (traceId=" + traceId
                                + ")");
                    }
                });
    }

    /**
     * Executes the provided slash command and records its execution time.
     * <p>
     * This method is designed to be run within the {@link #commandExecutor} thread
     * pool. It measures the
     * command's execution time and records it using {@link CommandMetrics}. Any
     * exceptions thrown
     * during execution are wrapped in a {@link RuntimeException} to be caught by
     * the calling
     * {@link CompletableFuture}'s error handler.
     *
     * @param event   The {@link SlashCommandInteractionEvent} that triggered the
     *                command.
     * @param command The {@link SlashCommand} to execute.
     * @param config  The configuration for the command.
     * @param traceId A unique trace ID for log correlation.
     * @throws RuntimeException if the command's execution fails.
     */
    private void runCommand(SlashCommandInteractionEvent event,
            SlashCommand command,
            SlashCommandConfig config,
            String traceId) {
        long start = System.currentTimeMillis();
        try {
            Logger.debug(() -> "[" + EVENT_NAME + "] Executing '/" + config.name() + "' (traceId=" + traceId + ")");
            command.execute(client, event);
            metrics.recordExecutionTime(config.name(), System.currentTimeMillis() - start);
        } catch (Exception e) {
            throw new RuntimeException("Execution failed for '/" + config.name() + "'", e);
        }
    }

    /**
     * Handles and reports an error that occurred during command execution.
     * <p>
     * This method distinguishes between a timeout and other types of exceptions. It
     * logs the error
     * with the associated trace ID and user information, and then calls
     * {@link #sendUserError(SlashCommandInteractionEvent, String, String)}
     * to provide a user-facing message.
     *
     * @param event   The original event.
     * @param cmd     The name of the command that failed.
     * @param userId  The ID of the user who ran the command.
     * @param traceId The unique trace ID for the execution.
     * @param ex      The root cause of the exception.
     */
    private void handleError(SlashCommandInteractionEvent event,
            String cmd,
            String userId,
            String traceId,
            Throwable ex) {

        final boolean isTimeout = ex instanceof TimeoutException;

        final String title = (isTimeout
                ? Emojis.DEFAULT_ERROR + " Command Timed Out"
                : Emojis.DEFAULT_ERROR + " Something went wrong");

        final String description = (isTimeout
                ? "Your command `/" + cmd + "` took too long and was cancelled.\nPlease try again in a moment. (`"
                        + traceId + "`)"
                : "We ran into an issue while running `/" + cmd + "`. This isn’t your fault.\nPlease try again. " +
                        "If this keeps happening, share this code with support: `" + traceId + "`");

        if (isTimeout)
            Logger.error("[" + EVENT_NAME + "] Slash command '/" + cmd + "' timed out for user " + userId +
                    " (traceId=" + traceId + ")");
        else
            Logger.error("[" + EVENT_NAME + "] Slash command '/" + cmd + "' errored for user " + userId +
                    " (traceId=" + traceId + ")", ex);

        sendUserError(event, title, description);
    }

    /**
     * Sends an ephemeral error message to the user.
     * <p>
     * This method checks if the event has already been acknowledged and responds
     * accordingly,
     * ensuring the user receives the error message without fail. The message is
     * formatted as an
     * embed with a distinct color and icon.
     *
     * @param event       The {@link SlashCommandInteractionEvent} to reply to.
     * @param title       The title of the error embed.
     * @param description The body of the error message.
     */
    private void sendUserError(SlashCommandInteractionEvent event, String title, String description) {
        EmbedBuilder embed = new EmbedBuilder()
                .setColor(ColorCodes.ERROR_RED)
                .setTitle(title)
                .setDescription(description);

        if (event.isAcknowledged())
            event.getHook().sendMessageEmbeds(embed.build()).setEphemeral(true).queue();
        else
            event.replyEmbeds(embed.build()).setEphemeral(true).queue();
    }

    /**
     * Shuts down the command execution thread pool.
     * <p>
     * This method is crucial for a clean application shutdown. It first attempts a
     * graceful shutdown
     * and then, if necessary, forces a shutdown after a 10-second timeout to
     * prevent the application
     * from hanging.
     *
     * @see ExecutorService#shutdown()
     * @see ExecutorService#awaitTermination(long, TimeUnit)
     * @see ExecutorService#shutdownNow()
     */
    public void shutdown() {
        commandExecutor.shutdown();
        try {
            if (!commandExecutor.awaitTermination(10, TimeUnit.SECONDS))
                commandExecutor.shutdownNow();
        } catch (InterruptedException e) {
            commandExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Creates a {@link ThreadFactory} for the command execution thread pool.
     * <p>
     * This factory ensures that all threads created for command execution are
     * properly named for
     * easier debugging and monitoring. It also sets them as daemon threads and
     * provides a
     * global uncaught exception handler to log any unexpected errors.
     *
     * @return A new {@link ThreadFactory} instance.
     */
    private static ThreadFactory slashCommandThreadFactory() {
        return r -> {
            Thread t = new Thread(r, "SlashCommand-" + THREAD_SEQ.getAndIncrement());
            t.setDaemon(true);
            t.setUncaughtExceptionHandler(
                    (thr, ex) -> Logger.error("[" + EVENT_NAME + "] Uncaught in " + thr.getName(), ex));
            return t;
        };
    }

    /**
     * Unwraps the root cause of an exception from a {@link CompletionException} or
     * {@link ExecutionException}.
     * <p>
     * These exception types are commonly thrown by {@link CompletableFuture} and
     * contain the
     * actual cause of the failure. This utility method helps in getting to the root
     * cause for
     * more accurate error handling and logging.
     *
     * @param ex The exception to unwrap.
     * @return The root cause of the exception, or the original exception if no
     *         cause is found, or it's not a wrapper.
     */
    private static Throwable unwrapCompletion(Throwable ex) {
        if (ex instanceof CompletionException || ex instanceof ExecutionException) {
            return ex.getCause() != null ? ex.getCause() : ex;
        }
        return ex;
    }

    /**
     * Generates a short, unique trace ID.
     * <p>
     * This method creates a random UUID and returns its first 8 characters, which
     * is sufficient for
     * correlating logs in a single command execution while being compact and easy
     * to read.
     *
     * @return A short trace ID string.
     */
    private static String shortTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}