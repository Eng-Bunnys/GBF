package org.bunnys.handler.events;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.utils.Logger;

import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public class EventLoader {
    public static List<Event> loadEvents(String packageName) {
        List<Event> eventInstances = new ArrayList<>();

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(packageName)
                .scan()) {

            for (ClassInfo classInfo : scanResult.getAllClasses()) {
                try {
                    Class<?> cls = classInfo.loadClass();

                    if (Event.class.isAssignableFrom(cls) && !Modifier.isAbstract(cls.getModifiers())) {
                        Event eventInstance = (Event) cls.getDeclaredConstructor().newInstance();
                        eventInstances.add(eventInstance);
                    }
                } catch (Exception err) {
                    Logger.error("Error loading event: " + classInfo.getName() + "\n" + err.getMessage());
                }
            }

            if (eventInstances.isEmpty())
                throw new IllegalStateException("No events found in the specified package: " + packageName);

        } catch (Exception e) {
            Logger.error("Failed to scan events in package: " + packageName + "\n" + e.getMessage());
            throw new IllegalStateException("Failed to load events from package: " + packageName, e);
        }

        return eventInstances;
    }
}