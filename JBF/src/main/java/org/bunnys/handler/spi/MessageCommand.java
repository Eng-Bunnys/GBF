package org.bunnys.handler.spi;

import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import org.bunnys.handler.JBF;
import org.bunnys.handler.commands.message.MessageCommandConfig;

/**
 * Base class for legacy message based commands
 * Implementations override commandOptions(...) and execute(...)
 */
public abstract class MessageCommand {
    // Lazily initialized config snapshot
    private volatile MessageCommandConfig config;

    /**
     * Called by the loader to allow command to declare metadata
     * Implementations should populate the provided builder and return
     */
    protected abstract void commandOptions(MessageCommandConfig.Builder options);

    /**
     * Command code to be executed when the command is invoked, must be quick and
     * non-blocking
     * Offload heavy work to the executor
     *
     * @param client  JBF Client instance (access to config, shardManager, etc.)
     * @param message The MessageReceivedEvent that triggered the command
     * @param args    The command args split by whitespace, no advanced parsing,
     *                prefix and command name removed
     */
    public abstract void execute(JBF client, MessageReceivedEvent message, String[] args);

    /**
     * Called by the loader (or first-time user code) to initialize and return the
     * immutable config
     * Thread-safe and idempotent
     */
    public final MessageCommandConfig initAndGetConfig() {
        MessageCommandConfig local = this.config;
        if (local != null)
            return local;

        synchronized (this) {
            if (this.config != null)
                return this.config;

            MessageCommandConfig.Builder builder = new MessageCommandConfig.Builder();
            this.commandOptions(builder);
            MessageCommandConfig built = builder.build();
            this.config = built;
            return built;
        }
    }
}
