package org.bunnys.handler.events.defaults;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.message.MessageCommand;
import org.bunnys.handler.events.Event;

public class MessageCreate extends ListenerAdapter implements Event {

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        System.out.println("In onMessageReceived");
        String prefix = "!"; // optionally make this configurable
        String content = event.getMessage().getContentRaw();

        System.out.println("Content: " + content);

        if (!content.startsWith(prefix) || event.getAuthor().isBot())
            return;

        String[] split = content.substring(prefix.length()).split("\\s+");
        String commandName = split[0];
        System.out.println("Command Name: " + commandName);
        String[] args = split.length > 1 ? content.substring(prefix.length() + commandName.length()).trim().split("\\s+") : new String[0];

        GBF client = GBF.getClient();

        MessageCommand command = client.getCommand(commandName);
        System.out.println("Command: " + command);
        if (command != null) {
            command.execute(event, args);
        }
    }
}
