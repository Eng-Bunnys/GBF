package org.bunnys.handler.commands;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ScanResult;
import org.bunnys.handler.JBF;
import org.bunnys.handler.spi.MessageCommand;
import org.bunnys.handler.utils.Logger;

import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public class CommandLoader {
    private final String basePackage;
    private final JBF client;

    public CommandLoader(String basePackage, JBF client) {
        this.basePackage = basePackage;
        this.client = client;
    }

    public List<MessageCommand> loadMessageCommands() {
        List<MessageCommand> out = new ArrayList<>();

        if (basePackage == null || basePackage.isBlank())
            return out;

        try (ScanResult scanResult = new ClassGraph().enableClassInfo().acceptPackages(basePackage).scan()) {
            scanResult.getSubclasses(MessageCommand.class.getName())
                    .forEach(classInfo -> {
                        try {
                            Class<?> clazz = classInfo.loadClass();

                            if (Modifier.isAbstract(clazz.getModifiers()))
                                return;

                            // Try ctor(JBF)
                            MessageCommand instance = tryInstantiate(clazz);

                            if (instance != null) {
                                out.add(instance);
                                Logger.debug(() -> "[CommandLoader] Loaded Message Command: " + clazz.getName());
                            }
                        } catch (Exception error) {
                            Logger.error("[CommandLoader] Failed to load Message Command: " + classInfo.getName(),
                                    error);
                        }
                    });
        } catch (Exception error) {
            Logger.error("[CommandLoader] ClassGraph scan failed for " + basePackage, error);
        }

        return out;
    }

    private MessageCommand tryInstantiate(Class<?> clazz) {
        try {
            Constructor<?> ctor = clazz.getDeclaredConstructor(JBF.class);
            return (MessageCommand) ctor.newInstance(client);
        } catch (NoSuchMethodException ignored) {
            // try no-arg
        } catch (Exception error) {
            Logger.error("[CommandLoader] Failed to get constructor with JBF param for " + clazz.getName(), error);
            return null;
        }

        try {
            Constructor<?> c0 = clazz.getDeclaredConstructor();
            c0.setAccessible(true);
            return (MessageCommand) c0.newInstance();
        } catch (Exception error) {
            Logger.error("[CommandLoader] Failed to get no-arg constructor for " + clazz.getName(), error);
            return null;
        }
    }
}