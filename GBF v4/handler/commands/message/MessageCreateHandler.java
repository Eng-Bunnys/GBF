package org.bunnys.handler.commands.message;

import net.dv8tion.jda.api.entities.Message;
import net.dv8tion.jda.api.entities.UserSnowflake;
import net.dv8tion.jda.api.entities.channel.concrete.TextChannel;
import net.dv8tion.jda.api.entities.channel.middleman.MessageChannel;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.utils.messages.MessageCreateData;
import org.bunnys.handler.GBF;

import static org.bunnys.utils.Utils.sendAndDelete;

public class MessageCreateHandler {
    private final MessageReceivedEvent event;
    private final Message message;
    private final GBF client;

    public MessageCreateHandler(MessageReceivedEvent event) {
        this.client = GBF.getClient();
        this.event = event;

        this.message = event.getMessage();
    }

    public boolean handleChecks() {
        // To-Do: Later add feature for non-guild commands
        if (this.event.getAuthor().isBot() || !this.message.isFromGuild())
            return false;

        String messageContent = this.message.getContentRaw();

        if (!messageContent.startsWith(this.client.getConfig().Prefix()))
            return false;

        MessageChannel channel = this.message.getChannel();

        String[] split = messageContent.substring(this.client.getConfig().Prefix().length())
                .split("\\s+");

        String commandName = this.client.resolveCommandFromAlias(split[0]);

        MessageCommand command = this.client.getMessageCommand(commandName);

        if (command == null)
            return false;

        // Arguably the most important check, so we do it first
        if (command.CommandOptions().isNSFW() && (!((TextChannel) channel).isNSFW())) {
            sendAndDelete(channel,
                    MessageCreateData
                            .fromContent(this.message.getAuthor() + ", This command can only be used in NSFW channels"),
                    5);
            return false;
        }

        if (command.CommandOptions().isDeveloperOnly()
                && !this.client.getConfig().Developers()
                        .contains(UserSnowflake.fromId(this.message.getAuthor().getId()))) {
            sendAndDelete(channel,
                    MessageCreateData.fromContent(
                            this.message.getAuthor().getAsMention() + ", this command can only be used by developers."),
                    5);
            return false;
        }

        return false;
    }
}
