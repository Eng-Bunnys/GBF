package org.bunnys.handler.events;

import org.bunnys.handler.JBF;
import org.bunnys.handler.events.defaults.ClientReady;
import org.bunnys.handler.events.defaults.MessageCreate;
import org.bunnys.handler.spi.Event;

import java.util.function.Function;

public enum DefaultEvents {
    CLIENT_READY(ClientReady::new),
    MESSAGE_CREATE(MessageCreate::new),

    ALL(client -> {
        throw new UnsupportedOperationException("ALL is not instantiable");
    });

    private final Function<JBF, Event> factory;

    DefaultEvents(Function<JBF, Event> factory) {
        this.factory = factory;
    }

    public Event create(JBF client) {
        if (this == ALL)
            throw new UnsupportedOperationException("Cannot create event for ALL");
        return this.factory.apply(client);
    }
}
