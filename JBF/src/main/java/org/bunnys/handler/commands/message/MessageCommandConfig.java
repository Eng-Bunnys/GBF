package org.bunnys.handler.commands.message;

import java.util.List;
import java.util.Objects;

@SuppressWarnings("unused")
public final class MessageCommandConfig {
    private final String commandName;
    private final String commandDescription;
    private final String commandUsage;
    private final List<String> aliases;

    private MessageCommandConfig(Builder builder) {
        this.commandName = Objects.requireNonNull(builder.commandName, "Command name is required");
        this.commandDescription = builder.commandDescription;
        this.commandUsage = builder.commandUsage;
        this.aliases = List.copyOf(builder.aliases);
    }

    public String commandName() {
        return this.commandName;
    }

    public String description() {
        return this.commandDescription;
    }

    public String usage() {
        return this.commandUsage;
    }

    public List<String> aliases() {
        return List.copyOf(this.aliases);
    }

    // --------------------- Builder --------------------//
    @SuppressWarnings("unused")
    public static final class Builder {
        private String commandName;
        private String commandDescription = "No description provided";
        private String commandUsage = "No usage provided";
        private List<String> aliases = List.of();

        public Builder name(String commandName) {
            if (commandName == null || commandName.isBlank())
                throw new IllegalArgumentException("Command name cannot be null or blank");

            this.commandName = commandName;
            return this;
        }

        public Builder description(String commandDescription) {
            this.commandDescription = commandDescription == null ? "No description provided" : commandDescription;
            return this;
        }

        public Builder usage(String commandUsage) {
            this.commandUsage = commandUsage == null ? "No usage provided" : commandUsage;
            return this;
        }

        public Builder aliases(List<String> aliases) {
            this.aliases = aliases == null ? List.of() : List.copyOf(aliases);
            return this;
        }

        public Builder aliases(String... aliases) {
            if (aliases == null || aliases.length == 0)
                this.aliases = List.of();
            else
                this.aliases = List.of(aliases);
            return this;
        }

        public MessageCommandConfig build() {
            return new MessageCommandConfig(this);
        }
    }

    @Override
    public String toString() {
        return "MessageCommandConfig{name='%s', aliases=%s}".formatted(this.commandName, this.aliases);
    }
}