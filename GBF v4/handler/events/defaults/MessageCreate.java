package org.bunnys.handler.events.defaults;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.message.MessageCommand;
import org.bunnys.handler.events.Event;
import org.bunnys.handler.utils.Logger;

public class MessageCreate extends ListenerAdapter implements Event {

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent message) {
        if (message.getAuthor().isBot())
            return;

        String messageContent = message.getMessage().getContentRaw();

        String prefix = GBF.getClient().config.Prefix();

        if (!messageContent.startsWith(prefix))
            return;

        String[] split = messageContent.substring(prefix.length())
                .split("\\s+");

        String commandName = split[0];

        GBF client = GBF.getClient();

        MessageCommand command =
                client.getCommand(commandName);

        if (command == null)
            return;

        String[] args = split.length > 1
                ? messageContent.substring(prefix.length() + commandName.length())
                .trim().split("\\s+")
                : new String[0];

            try {
                command.execute(client, message, args);
            } catch (Exception err) {
                Logger.error("• Error executing command: " + commandName + "\n" + err.getMessage());
            }
    }
}