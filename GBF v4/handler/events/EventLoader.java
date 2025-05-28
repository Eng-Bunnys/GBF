package org.bunnys.handler.events;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.GBF;
import org.bunnys.handler.utils.Logger;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executor;

public class EventLoader {
    private static final Executor SHARED_POOL = GBF.SHARED_POOL;

    public static List<Event> loadEvents(String packageName) {
        if (packageName == null || packageName.isBlank()) {
            Logger.warning("Package name is null or blank. Skipping event loading.");
            return List.of();
        }

        long startTime = System.nanoTime();
        ConcurrentLinkedQueue<Event> eventInstances = new ConcurrentLinkedQueue<>();

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(packageName)
                .scan()) {

            List<ClassInfo> eventClasses = scanResult.getClassesImplementing(Event.class.getName())
                    .stream()
                    .filter(classInfo -> !classInfo.isAbstract())
                    .toList();

            CompletableFuture.supplyAsync(() -> {
                eventClasses.parallelStream().forEach(classInfo -> {
                    try {
                        Class<?> cls = classInfo.loadClass();
                        if (Event.class.isAssignableFrom(cls)) {
                            long instanceStart = System.nanoTime();
                            Event eventInstance = (Event) cls.getDeclaredConstructor().newInstance();
                            long instanceEnd = System.nanoTime();
                            if ((instanceEnd - instanceStart) / 1_000_000 > 1) {
                                Logger.warning("Slow instantiation for " + cls.getSimpleName() + ": " +
                                        (instanceEnd - instanceStart) / 1_000_000 + "ms");
                            }
                            eventInstances.add(eventInstance);
                        }
                    } catch (Exception e) {
                        Logger.error("Error loading event: " + classInfo.getName() + ": " + e.getMessage());
                    }
                });
                return null;
            }, SHARED_POOL).get();

            if (eventInstances.isEmpty()) {
                Logger.warning("No events found in package: " + packageName);
            } else {
                Logger.info("Loaded " + eventInstances.size() + " events from package: " + packageName);
            }
        } catch (Exception e) {
            Logger.error("Failed to scan events in package: " + packageName + ": " + e.getMessage());
            throw new IllegalStateException("Failed to load events from package: " + packageName, e);
        }

        Logger.info("Event loading took " + (System.nanoTime() - startTime) / 1_000_000 + "ms");
        return List.copyOf(eventInstances);
    }
}