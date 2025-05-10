package org.bunnys.handler.events.defaults;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.message.MessageCreateHandler;
import org.bunnys.handler.commands.message.MessageCreateHandler.CommandData;
import org.bunnys.handler.events.Event;
import org.bunnys.handler.utils.Logger;
import org.jetbrains.annotations.NotNull;

public class MessageCreate extends ListenerAdapter implements Event {

    @Override
    public void register(JDA jda) {
        jda.addEventListener(this);
    }

    @Override
    public void onMessageReceived(@NotNull MessageReceivedEvent event) {
        MessageCreateHandler handler = new MessageCreateHandler(event);
        CommandData result = handler.process();

        if (result == null)
            return;

        try {
            result.command().execute(GBF.getClient(), event, result.args());
        } catch (Exception err) {
            Logger.error("• Error executing command: " + result.commandName() + "\n" + err.getMessage());
        }
    }
}