// ctor is short for constructor lol
package org.bunnys.handler.events;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.Event;
import org.bunnys.handler.utils.Logger;
import java.util.List;

/*
* Bunny Comment:
* CopyOnWriteArrayList copies on every write, great for read-heavy, write-rare, terrible for bulk adds lol
* event count will be small; just stream and collect also parallelStream() rarely helps here and can hurt
* warmup
* You also gain determinism (sorted by simple name), which makes debugging reproducible
* */

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
        Logger.debug(() -> "[EventLoader] Scanning package: " + eventPackage);

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(eventPackage)
                .scan()) {

            var loaded = scanResult.getClassesImplementing(Event.class.getName())
                    .stream() // sequential: predictable, cheaper
                    .sorted(java.util.Comparator.comparing(ClassInfo::getSimpleName))
                    .map(ci -> {
                        try {
                            Class<?> clazz = ci.loadClass();
                            var ctor = clazz.getDeclaredConstructor(JBF.class); // require public(JBF)
                            return (Event) ctor.newInstance(client);
                        } catch (NoSuchMethodException e) {
                            Logger.error("[EventLoader] Missing ctor(JBF) in " + ci.getName(), e);
                            return null;
                        } catch (Exception e) {
                            Logger.error("[EventLoader] Failed to load " + ci.getName(), e);
                            return null;
                        }
                    })
                    .filter(java.util.Objects::nonNull)
                    .toList();

            Logger.debug(() -> "[EventLoader] Total events loaded: " + loaded.size());
            return loaded;
        }
    }
}
