package org.bunnys.handler.spi;

import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.commands.slash.SlashCommandConfig;

public abstract class SlashCommand {
    private volatile SlashCommandConfig config;

    /** Configure metadata (name + description) */
    protected abstract void commandOptions(SlashCommandConfig.Builder options);

    /** Execution logic */
    public abstract void execute(BunnyNexus client, SlashCommandInteractionEvent event);

    /** Lazy init + return config */
    public final SlashCommandConfig initAndGetConfig() {
        SlashCommandConfig local = this.config;
        if (local != null)
            return local;

        synchronized (this) {
            if (this.config != null)
                return this.config;

            SlashCommandConfig.Builder builder = new SlashCommandConfig.Builder();
            this.commandOptions(builder);
            SlashCommandConfig built = builder.build();
            this.config = built;
            return built;
        }
    }
}
