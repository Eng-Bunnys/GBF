package org.bunnys.handler.lifecycle;

import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;
import org.bunnys.handler.commands.CommandLoader;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.util.ArrayList;
import java.util.List;

public class CommandLifecycle {
    public static void loadAndRegisterCommands(Config config, JBF jbf, CommandRegistry registry) {
        if (config.commandsPackage() == null || config.commandsPackage().isBlank())
            return;

        CommandLoader loader = new CommandLoader(config.commandsPackage(), jbf);
        List<MessageCommand> commands = new ArrayList<>(loader.loadMessageCommands());

        if (commands.isEmpty()) {
            Logger.debug(() -> "[JBF] No message commands were loaded/found");
            return;
        }

        int success = 0;
        int failed = 0;

        for (MessageCommand cmd : commands) {
            try {
                MessageCommandConfig cfg = cmd.initAndGetConfig();
                registry.registerMessageCommand(cmd, cfg);
                success++;
            } catch (Throwable t) {
                failed++;
                Logger.error("[JBF] Failed to register message command: " + cmd.getClass().getName(), t);
            }
        }

        int finalSuccess = success;
        int finalFailed = failed;
        Logger.debug(() -> String.format("[JBF] Loaded %d message command(s), %d failed to register.", finalSuccess,
                finalFailed));
    }
}
