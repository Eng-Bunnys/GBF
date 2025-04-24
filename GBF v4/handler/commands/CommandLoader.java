package org.bunnys.handler.commands;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.commands.message.MessageCommand;
import org.bunnys.handler.utils.Logger;

import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.Map;

public class CommandLoader {

    public static Map<String, MessageCommand> loadCommands(String packageName) {
        Map<String, MessageCommand> messageCommands = new HashMap<>();

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(packageName)
                .scan()) {

            for (ClassInfo classInfo : scanResult.getSubclasses(MessageCommand.class.getName())) {
                try {
                    Class<?> cls = classInfo.loadClass();

                    if (!Modifier.isAbstract(cls.getModifiers()) && MessageCommand.class.isAssignableFrom(cls)) {
                        MessageCommand commandInstance = (MessageCommand) cls.getDeclaredConstructor().newInstance();

                        String commandName = commandInstance.CommandOptions().getName();

                        if (commandName == null || commandName.isBlank())
                            throw new IllegalStateException("Command name is not defined for "
                                    + commandInstance.getClass().getSimpleName());

                        if (messageCommands.containsKey(commandName))
                            throw new IllegalStateException("Duplicate command name detected: '" + commandName +
                                    "' in classes " + messageCommands.get(commandName).getClass().getName() + " and "
                                    + cls.getName());

                        messageCommands.put(commandName, commandInstance);
                    }
                } catch (Exception err) {
                    Logger.error("Error loading command: " + classInfo.getName() + "\n" + err.getMessage());
                }
            }

            if (messageCommands.isEmpty())
                throw new IllegalStateException("No commands found in the specified package: " + packageName);

        } catch (Exception e) {
            Logger.error("Failed to scan commands in package: " + packageName + "\n" + e.getMessage());
            throw new IllegalStateException("Failed to load commands from package: " + packageName, e);
        }

        return messageCommands;
    }
}
