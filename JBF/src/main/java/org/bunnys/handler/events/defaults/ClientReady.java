package org.bunnys.handler.events.defaults;

import com.github.lalyos.jfiglet.FigletFont;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.events.session.ReadyEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.dv8tion.jda.api.interactions.commands.build.CommandData;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import net.dv8tion.jda.api.interactions.commands.build.SlashCommandData;
import net.dv8tion.jda.api.sharding.ShardManager;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.commands.slash.SlashCommandConfig;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.handler.colors.ConsoleColors;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class ClientReady extends ListenerAdapter implements Event {
    private final BunnyNexus client;

    public ClientReady(BunnyNexus client) {
        this.client = client;
    }

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onReady(ReadyEvent event) {
        final String clientName = event.getJDA().getSelfUser().getName();
        final String asciiArt = renderASCII(clientName);

        final String[] lines = asciiArt.split("\n");
        final int maxLength = Arrays.stream(lines)
                .mapToInt(String::length)
                .max()
                .orElse(clientName.length());

        final String underline = "_".repeat(maxLength);

        System.out.println(ConsoleColors.RED + asciiArt + underline + ConsoleColors.RESET);
        System.out.println("• " + clientName + " v" + this.client.getConfig().version());

        // TODO: Move command deployment outside of this file

        // --- Deploy commands now that guilds are cached -- //
        CommandRegistry registry = this.client.commandRegistry();
        String[] testServers = this.client.getConfig().testServers();

        ShardManager shardManager = event.getJDA().getShardManager();
        if (shardManager == null) {
            Logger.error("[ClientReady] ShardManager was null during command deployment");
            return;
        }

        // Precompute global + test-only commands once
        List<SlashCommandData> globalCommands = registry.slashView().values().stream()
                .map(cmd -> {
                    SlashCommandConfig cfg = cmd.initAndGetConfig();
                    if (cfg.testOnly())
                        return null;
                    return Commands.slash(cfg.name(), cfg.description())
                            .addOptions(cfg.options())
                            .addSubcommands(cfg.subcommands())
                            .addSubcommandGroups(cfg.subcommandGroups());
                })
                .filter(Objects::nonNull)
                .toList();

        List<SlashCommandData> testOnlyCommands = registry.slashView().values().stream()
                .map(cmd -> {
                    SlashCommandConfig cfg = cmd.initAndGetConfig();
                    if (!cfg.testOnly())
                        return null;
                    return Commands.slash(cfg.name(), cfg.description())
                            .addOptions(cfg.options());
                })
                .filter(Objects::nonNull)
                .toList();

        for (JDA jda : shardManager.getShards()) {
            // Replace global commands
            jda.updateCommands().addCommands(globalCommands).queue();

            // Replace per-guild commands
            for (String guildId : testServers) {
                Guild guild = jda.getGuildById(guildId);
                if (guild != null) {
                    // Merge global + test-only so test guilds act as a superset
                    List<CommandData> merged = new ArrayList<>();
                    merged.addAll(globalCommands);
                    merged.addAll(testOnlyCommands);

                    guild.updateCommands().addCommands(merged).queue();
                }
            }
        }

    }

    /**
     * Render ASCII safely; fallback to plain text if figlet fails
     */
    private String renderASCII(String text) {
        try {
            return FigletFont.convertOneLine(text);
        } catch (IOException e) {
            Logger.warning(
                    "[ClientReady] Failed to render ASCII art. Falling back to plain text\nError: " + e.getMessage());
            return text;
        }
    }
}
