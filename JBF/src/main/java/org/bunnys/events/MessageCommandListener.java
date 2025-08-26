package org.bunnys.events;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.JBF;
import org.bunnys.handler.commands.CommandRegistry;
import org.bunnys.handler.commands.message.MessageCommandConfig;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

public class MessageCommandListener extends ListenerAdapter implements Event {

    private final JBF client;
    private final CommandRegistry registry;

    public MessageCommandListener(JBF client) {
        this.client = client;
        this.registry = client.getConfig() != null ? client.commandRegistry() : null;
    }

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        // ignore bots/webhooks
        if (event.getAuthor().isBot() || event.isWebhookMessage()) {
            return;
        }

        Message message = event.getMessage();
        String raw = message.getContentRaw();

        // get configured prefix
        String prefix = "!!";

        if (!raw.startsWith(prefix)) {
            return;
        }

        // remove prefix and split into args
        String[] parts = raw.substring(prefix.length()).trim().split("\\s+");
        if (parts.length == 0) {
            return;
        }

        String commandName = parts[0];
        String[] args = parts.length > 1
                ? java.util.Arrays.copyOfRange(parts, 1, parts.length)
                : new String[0];

        var entry = client.commandRegistry().findMerged(commandName);
        if (entry == null) {
            Logger.debug(() -> "[MessageCommandListener] Unknown command: " + commandName);
            return;
        }

        if (entry.type() == CommandRegistry.CommandEntry.CommandType.MESSAGE) {
            try {
                MessageCommandConfig cfg = entry.messageMetaData();
                entry.messageCommand().execute(client, event, args);
                Logger.debug(() -> "[MessageCommandListener] Executed command: " + cfg.commandName());
            } catch (Exception e) {
                Logger.error("[MessageCommandListener] Error executing command: " + commandName, e);
                MessageChannel channel = message.getChannel();
                channel.sendMessage("⚠️ An error occurred while executing that command.").queue();
            }
        }
    }
}
