package org.bunnys.handler.events.defaults;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
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
    public void onMessageReceived(MessageReceivedEvent event) {
        // Will be replaced by the MessageCreateHandler soon
        Message message = event.getMessage();

        if (event.getAuthor().isBot())
            return;

        String messageContent = event.getMessage().getContentRaw();

        String prefix = GBF.getClient().getConfig().Prefix();

        MessageChannel channel = message.getChannel();

        if (!messageContent.startsWith(prefix))
            return;

        // Very interesting edge case lol
        if (!(channel instanceof TextChannel)) {
            message.reply("This command can only be used in text channels.").queue();
            return;
        }

        GBF client = GBF.getClient();

        String[] split = messageContent.substring(prefix.length())
                .split("\\s+");

        String commandName = client.resolveCommandFromAlias(split[0]);

        MessageCommand command = client.getMessageCommand(commandName);

        if (command == null)
            return;

        if (command.CommandOptions().isNSFW())
            if (!((TextChannel) channel).isNSFW()) {
                message.reply("This command can only be used in NSFW channels.").queue();
                return;
            }

        String[] args = split.length > 1
                ? messageContent.substring(prefix.length() + commandName.length())
                        .trim().split("\\s+")
                : new String[0];

        try {
            command.execute(client, event, args);
        } catch (Exception err) {
            Logger.error("• Error executing command: " + commandName + "\n" + err.getMessage());
        }
    }
}