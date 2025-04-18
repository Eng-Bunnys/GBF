package org.bunnys.handler.events;

import org.bunnys.handler.utils.Logger;
import org.reflections.Reflections;
import org.reflections.scanners.Scanners;

import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class EventLoader {
    public static List<Event> loadEvents(String packageName) {
        Reflections reflections = new Reflections(packageName,
                Scanners.SubTypes.filterResultsBy(s -> true));

        Set<Class<? extends Event>> classes = reflections.getSubTypesOf(Event.class);

        List<Event> eventInstances = new ArrayList<>();

        for (Class<? extends Event> eventClass : classes) {
            try {
                if (!Modifier.isAbstract(eventClass.getModifiers()))
                    eventInstances.add(eventClass.getDeclaredConstructor().newInstance());
            } catch (Exception err) {
                Logger.error("Error loading event: " + eventClass.getName() + "\n");
                Logger.error("Error: " + err.getMessage());
            }
        }
        return eventInstances;
    }
}
