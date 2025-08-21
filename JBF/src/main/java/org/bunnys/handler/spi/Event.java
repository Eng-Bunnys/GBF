package org.bunnys.handler.spi;

import net.dv8tion.jda.api.JDA;

/**
 * Contract for dynamically loaded events
 */
public interface Event {
    void register(JDA jda);
}
