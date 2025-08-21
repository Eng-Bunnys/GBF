package org.bunnys.handler.events;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamically loads event classes from a given package.
 */
public class EventLoader {

    private final String eventPackage;
    private final Object client; // reference to Client
    private final List<Event> events = new ArrayList<>();

    public EventLoader(String eventPackage, Object client) {
        this.eventPackage = eventPackage;
        this.client = client;
    }

    public List<Event> loadEvents() {
        Logger.info("[EventLoader] Scanning package: " + eventPackage);

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(eventPackage)
                .scan()) {

            scanResult.getClassesImplementing(Event.class.getName()).forEach(classInfo -> {
                try {
                    Class<?> clazz = classInfo.loadClass();
                    Constructor<?> ctor = clazz.getConstructor(client.getClass());
                    Event event = (Event) ctor.newInstance(client);

                    events.add(event);
                    Logger.success("[EventLoader] Loaded event: " + clazz.getSimpleName());
                } catch (Exception e) {
                    Logger.error("[EventLoader] Failed to load event: " + classInfo.getName(), e);
                }
            });
        }

        Logger.info("[EventLoader] Total events loaded: " + events.size());
        return events;
    }
}
