package org.bunnys.handler.lifecycle;

import net.dv8tion.jda.api.interactions.commands.build.Commands;
import org.bunnys.handler.Config;
import org.bunnys.handler.BunnyNexus;
import org.bunnys.handler.commands.CommandLoader;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.commands.slash.SlashCommandConfig;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.spi.SlashCommand;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.util.ArrayList;
import java.util.List;

public class CommandLifecycle {
    public static void loadAndRegisterCommands(Config config, BunnyNexus bunnyNexus, CommandRegistry registry) {
        if (config.commandsPackage() == null || config.commandsPackage().isBlank())
            return;

        CommandLoader loader = new CommandLoader(config.commandsPackage(), bunnyNexus);

        // --- Load message commands ---
        List<MessageCommand> messageCommands = new ArrayList<>(loader.loadMessageCommands());

        int successMsg = 0, failedMsg = 0;
        for (MessageCommand cmd : messageCommands) {
            try {
                MessageCommandConfig cfg = cmd.initAndGetConfig();
                registry.registerMessageCommand(cmd, cfg);
                successMsg++;
            } catch (Throwable t) {
                failedMsg++;
                Logger.error("[BunnyNexus] Failed to register message command: " + cmd.getClass().getName(), t);
            }
        }
        int finalSuccessMsg = successMsg;
        int finalFailedMsg = failedMsg;
        Logger.debug(() -> String.format("[BunnyNexus] Loaded %d message command(s), %d failed to register.",
                finalSuccessMsg, finalFailedMsg));


        // --- Load slash commands ---
        List<SlashCommand> slashCommands = new ArrayList<>(loader.loadSlashCommands());
        int successSlash = 0, failedSlash = 0;

        for (SlashCommand cmd : slashCommands) {
            try {
                SlashCommandConfig cfg = cmd.initAndGetConfig();
                registry.registerSlashCommand(cmd, cfg);

                // Register into Discord via JDA
                bunnyNexus.getShardManager().getGuilds().forEach(guild -> {
                    System.out.println(guild.getName());
                });

                bunnyNexus.getShardManager().getShards().forEach(jda ->
                        jda.updateCommands()
                                .addCommands(Commands.slash(cfg.name(), cfg.description())
                                        .addOptions(cfg.options())
                                )
                                .queue()
                );

                successSlash++;
            } catch (Throwable t) {
                failedSlash++;
                Logger.error("[BunnyNexus] Failed to register slash command: " + cmd.getClass().getName(), t);
            }
        }
        int finalSuccessSlash = successSlash;
        int finalFailedSlash = failedSlash;
        Logger.debug(() -> String.format("[BunnyNexus] Loaded %d slash command(s), %d failed to register.",
                finalSuccessSlash, finalFailedSlash));
    }
}
