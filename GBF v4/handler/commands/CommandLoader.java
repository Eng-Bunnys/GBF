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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;

public class CommandLoader {
    private static final Executor SHARED_POOL = GBF.SHARED_POOL;

    public static ConcurrentHashMap<String, MessageCommand> loadCommands(String packageName, Config config) {
        if (packageName == null || packageName.isBlank()) {
            throw new IllegalArgumentException("Package name cannot be null or blank");
        }

        long startTime = System.nanoTime();
        ConcurrentHashMap<String, MessageCommand> messageCommands = new ConcurrentHashMap<>();
        ConcurrentHashMap<String, Set<String>> aliasMap = new ConcurrentHashMap<>();
        ConcurrentHashMap<String, String> aliasToCommandMap = new ConcurrentHashMap<>();
        ConcurrentHashMap<Class<?>, Constructor<?>> constructorCache = new ConcurrentHashMap<>();

        try (ScanResult scanResult = new ClassGraph()
                .enableClassInfo()
                .acceptPackages(packageName)
                .scan()) {

            if (config.LogActions()) {
                Logger.info("Command class scanning took " + (System.nanoTime() - startTime) / 1_000_000 + "ms");
            }

            CompletableFuture.supplyAsync(() -> {
                scanResult.getSubclasses(MessageCommand.class.getName())
                        .parallelStream()
                        .forEach(classInfo -> {
                            try {
                                Class<?> cls = classInfo.loadClass();
                                if (!java.lang.reflect.Modifier.isAbstract(cls.getModifiers())
                                        && MessageCommand.class.isAssignableFrom(cls)) {
                                    Constructor<?> constructor = constructorCache.computeIfAbsent(cls, c -> {
                                        try {
                                            return c.getDeclaredConstructor();
                                        } catch (NoSuchMethodException e) {
                                            throw new IllegalStateException("No default constructor for " + c.getName(), e);
                                        }
                                    });

                                    long instanceStart = System.nanoTime();
                                    MessageCommand commandInstance = (MessageCommand) constructor.newInstance();
                                    long instanceEnd = System.nanoTime();

                                    MessageCommandConfig options = commandInstance.CommandOptions();
                                    if (options == null) {
                                        throw new IllegalStateException("CommandOptions() must return MessageCommandConfig for " + cls.getName());
                                    }

                                    String commandName = options.getName();
                                    if (commandName == null || commandName.isBlank()) {
                                        throw new IllegalStateException("Command name is not defined for " + cls.getSimpleName());
                                    }

                                    if (messageCommands.putIfAbsent(commandName, commandInstance) != null) {
                                        throw new IllegalStateException("Duplicate command name detected: '" + commandName + "'");
                                    }

                                    String[] aliases = options.getAliases();
                                    if (aliases != null && aliases.length > 0) {
                                        for (String alias : aliases) {
                                            if (aliasToCommandMap.putIfAbsent(alias, commandName) != null) {
                                                throw new IllegalStateException("Duplicate alias detected: '" + alias + "' for command " + commandName);
                                            }
                                        }
                                        aliasMap.put(commandName, Set.copyOf(Arrays.asList(aliases)));
                                    }

                                    if ((instanceEnd - instanceStart) / 1_000_000 > 1) {
                                        Logger.warning("Slow instantiation for " + cls.getSimpleName() + ": " +
                                                (instanceEnd - instanceStart) / 1_000_000 + "ms");
                                    }
                                }
                            } catch (Exception e) {
                                Logger.error("Error loading command: " + classInfo.getName() + ": " + e.getMessage());
                            }
                        });
                return null;
            }, SHARED_POOL).get();

            if (messageCommands.isEmpty()) {
                throw new IllegalStateException("No commands found in package: " + packageName);
            }

            GBF client = GBF.getClient();
            aliasMap.forEach((cmd, aliasSet) -> {
                if (!aliasSet.isEmpty()) {
                    client.setAlias(cmd, aliasSet.toArray(new String[0]));
                }
            });

        } catch (Exception e) {
            Logger.error("Failed to scan commands in package: " + packageName + ": " + e.getMessage());
            throw new IllegalStateException("Failed to load commands from package: " + packageName, e);
        }

        if (config.LogActions()) {
            Logger.info("Command loading took " + (System.nanoTime() - startTime) / 1_000_000 + "ms");
        }
        return messageCommands;
    }
}