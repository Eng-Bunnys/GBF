package org.bunnys.handler.events;

import net.dv8tion.jda.api.JDA;

public interface Event {
    void register(JDA jda);
}
