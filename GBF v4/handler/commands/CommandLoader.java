package org.bunnys.handler.commands;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.GBF;
import org.bunnys.handler.commands.message.config.MessageCommand;
import org.bunnys.handler.commands.message.config.MessageCommandConfig;
import org.bunnys.handler.config.Config;
import org.bunnys.handler.utils.Logger;

import java.lang.reflect.Constructor;
import java.util.Arrays;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ForkJoinPool;

public class CommandLoader {
    public static ConcurrentHashMap<String, MessageCommand> loadCommands(String packageName, Config config) {
        if (packageName == null || packageName.isBlank())
            throw new IllegalArgumentException("Package name cannot be null or blank");

        long startTime = System.nanoTime();
        ConcurrentHashMap<String, MessageCommand> messageCommands = new ConcurrentHashMap<>();
        ConcurrentHashMap<String, Set<String>> aliasMap = new ConcurrentHashMap<>();
        ConcurrentHashMap<String, String> aliasToCommandMap = new ConcurrentHashMap<>();
        ConcurrentHashMap<Class<?>, Constructor<?>> constructorCache = new ConcurrentHashMap<>();

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(packageName)
                .scan()) {

            long scanEndTime = System.nanoTime();
            if (config.LogActions()) {
                Logger.info("Command class scanning took " + (scanEndTime - startTime) / 1_000_000 + "ms");
            }

            @SuppressWarnings("resource")
            ForkJoinPool threadPool = new ForkJoinPool(Math.max(4, Runtime.getRuntime().availableProcessors() * 2));
            try {
                threadPool.submit(() -> scanResult.getSubclasses(MessageCommand.class.getName())
                        .parallelStream()
                        .forEach(classInfo -> {
                            try {
                                Class<?> cls = classInfo.loadClass();
                                if (!java.lang.reflect.Modifier.isAbstract(cls.getModifiers())
                                        && MessageCommand.class.isAssignableFrom(cls)) {
                                    Constructor<?> constructor = constructorCache
                                            .computeIfAbsent(cls, c -> {
                                                try {
                                                    return c.getDeclaredConstructor();
                                                } catch (NoSuchMethodException e) {
                                                    throw new IllegalStateException(
                                                            "No default constructor for " + c.getName(),
                                                            e);
                                                }
                                            });

                                    long instanceStart = System.nanoTime();
                                    MessageCommand commandInstance = (MessageCommand) constructor.newInstance();
                                    long instanceEnd = System.nanoTime();

                                    MessageCommandConfig options = commandInstance.CommandOptions();

                                    if (options == null)
                                        throw new IllegalStateException(
                                                "CommandOptions() must return MessageCommandConfig for "
                                                        + cls.getName());

                                    String commandName = options.getName();
                                    String[] aliases = options.getAliases();

                                    if (commandName == null || commandName.isBlank())
                                        throw new IllegalStateException("Command name is not defined for " +
                                                cls.getSimpleName());

                                    if (messageCommands.putIfAbsent(commandName, commandInstance) != null)
                                        throw new IllegalStateException("Duplicate command name detected: '" +
                                                commandName + "' in classes " +
                                                messageCommands.get(commandName).getClass().getName() + " and " +
                                                cls.getName());

                                    if (aliases != null && aliases.length > 0) {
                                        for (String alias : aliases) {
                                            String existingCommand = aliasToCommandMap.putIfAbsent(alias, commandName);
                                            if (existingCommand != null)
                                                throw new IllegalStateException("Duplicate alias detected: '" + alias +
                                                        "' for command " + commandName + " (already used by " +
                                                        existingCommand + ")");
                                        }
                                        aliasMap.put(commandName, Set.copyOf(Arrays.asList(aliases)));
                                    }
                                }
                            } catch (Exception err) {
                                Logger.error("Error loading command: " + classInfo.getName() + ": " + err.getMessage() +
                                        "\n" + Arrays.toString(err.getStackTrace()));
                            }
                        })).get();

            } catch (Exception e) {
                Logger.error("Failed to process commands: " + e.getMessage() +
                        "\n" + Arrays.toString(e.getStackTrace()));
                throw new IllegalStateException("Failed to process commands for package: " + packageName, e);
            } finally {
                threadPool.shutdown();
            }

            if (messageCommands.isEmpty()) {
                throw new IllegalStateException("No commands found in the specified package: " + packageName);
            }

            GBF client = GBF.getClient();
            aliasMap.forEach((cmd, aliasSet) -> {
                if (!aliasSet.isEmpty())
                    client.setAlias(cmd, aliasSet.toArray(new String[0]));
            });

        } catch (Exception e) {
            Logger.error("Failed to scan commands in package: " + packageName + ": " + e.getMessage() +
                    "\n" + Arrays.toString(e.getStackTrace()));
            throw new IllegalStateException("Failed to load commands from package: " + packageName, e);
        }

        long endTime = System.nanoTime();
        if (config.LogActions()) {
            Logger.info("Command loading took " + (endTime - startTime) / 1_000_000 + "ms");
        }
        return messageCommands;
    }
}