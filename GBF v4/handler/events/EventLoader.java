package org.bunnys.handler.events;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.utils.Logger;

import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ForkJoinPool;

public class EventLoader {
    public static List<Event> loadEvents(String packageName) {
        if (packageName == null || packageName.isBlank()) {
            Logger.warning("Package name is null or blank. Skipping event loading.");
            return List.of();
        }

        long startTime = System.nanoTime();
        ConcurrentLinkedQueue<Event> eventInstances = new ConcurrentLinkedQueue<>();

        try (ScanResult scanResult = new ClassGraph()
                .enableAllInfo()
                .acceptPackages(packageName)
                .scan()) {

            long scanEndTime = System.nanoTime();
            Logger.info("Event class scanning took " + (scanEndTime - startTime) / 1_000_000 + "ms");

            List<ClassInfo> eventClasses = scanResult.getClassesImplementing(Event.class.getName())
                    .stream()
                    .filter(classInfo -> !classInfo.isAbstract())
                    .toList();

            @SuppressWarnings("resource")
            ForkJoinPool threadPool = new ForkJoinPool(Math.max(2, Runtime.getRuntime().availableProcessors()));
            try {
                threadPool.submit(() -> eventClasses
                        .parallelStream()
                        .forEach(classInfo -> {
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
                            } catch (Exception err) {
                                Logger.error("Error loading event: " + classInfo.getName() + ": " + err.getMessage() +
                                        "\nStack trace: " + java.util.Arrays.toString(err.getStackTrace()));
                            }
                        })).get();
            } catch (Exception e) {
                Logger.error("Failed to process events in package " + packageName + ": " + e.getMessage() +
                        "\nStack trace: " + java.util.Arrays.toString(e.getStackTrace()));
                throw new IllegalStateException("Failed to process events for package: " + packageName, e);
            } finally {
                threadPool.shutdown();
            }

            if (eventInstances.isEmpty()) {
                Logger.warning("No events found in package: " + packageName + ". Continuing without events.");
            } else {
                Logger.info("Loaded " + eventInstances.size() + " events from package: " + packageName);
            }
        } catch (Exception e) {
            Logger.error("Failed to scan events in package: " + packageName + ": " + e.getMessage() +
                    "\nStack trace: " + java.util.Arrays.toString(e.getStackTrace()));
            throw new IllegalStateException("Failed to load events from package: " + packageName, e);
        }

        long endTime = System.nanoTime();
        Logger.info("Event loading took " + (endTime - startTime) / 1_000_000 + "ms");
        return List.copyOf(eventInstances);
    }
}