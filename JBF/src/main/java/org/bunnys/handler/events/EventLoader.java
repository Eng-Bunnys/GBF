// ctor is short for constructor lol
package org.bunnys.handler.events;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;

import java.lang.reflect.Constructor;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Dynamically loads event classes from a given package,
 * requiring a constructor that accepts the JBF client
 * Optimized for sharded/multithreaded environments
 */
public final class EventLoader {
    private final String eventPackage;
    private final JBF client;

    public EventLoader(String eventPackage, JBF client) {
        this.eventPackage = eventPackage;
        this.client = client;
    }

    public List<Event> loadEvents() {
        Logger.debug("[EventLoader] Scanning package: " + eventPackage);

        // Thread-safe for parallel stream writes
        CopyOnWriteArrayList<Event> loadedEvents = new CopyOnWriteArrayList<>();

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(eventPackage)
                .scan()) {

            // Parallelize discovery + construction
            scanResult.getClassesImplementing(Event.class.getName())
                    .parallelStream()
                    .forEach(classInfo -> {
                        try {
                            Class<?> clazz = classInfo.loadClass();

                            // STRICT: require public ctor(JBF)
                            Constructor<?> ctor = clazz.getConstructor(JBF.class);
                            Event event = (Event) ctor.newInstance(client);

                            loadedEvents.add(event);
                            Logger.debug("[EventLoader] Loaded event: " + clazz.getSimpleName());
                        } catch (NoSuchMethodException e) {
                            Logger.error("[EventLoader] Missing required constructor (JBF) in "
                                            + classInfo.getName(),
                                    e);
                        } catch (Exception e) {
                            Logger.error("[EventLoader] Failed to load event: "
                                    + classInfo.getName(), e);
                        }
                    });
        }

        Logger.debug("[EventLoader] Total events loaded: " + loadedEvents.size());
        return List.copyOf(loadedEvents); // immutable snapshot
    }
}
