package org.bunnys.handler.commands.message;

import net.dv8tion.jda.api.Permission;
import java.util.*;

@SuppressWarnings("unused")
public final class MessageCommandConfig {
    private final String commandName;
    private final String commandDescription;
    private final String commandUsage;
    private final List<String> aliases;
    private final EnumSet<Permission> userPermissions;
    private final EnumSet<Permission> botPermissions;
    private final boolean devOnly;
    private final long cooldownMS;

    private MessageCommandConfig(Builder builder) {
        this.commandName = Objects.requireNonNull(builder.commandName, "Command name is required");
        this.commandDescription = builder.commandDescription;
        this.commandUsage = builder.commandUsage;
        this.aliases = List.copyOf(builder.aliases);
        this.userPermissions = EnumSet.copyOf(builder.userPermissions);
        this.botPermissions = EnumSet.copyOf(builder.botPermissions);
        this.devOnly = builder.devOnly;
        this.cooldownMS = builder.cooldownMS;
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

    public EnumSet<Permission> userPermissions() {
        return EnumSet.copyOf(this.userPermissions);
    }

    public EnumSet<Permission> botPermissions() {
        return EnumSet.copyOf(this.botPermissions);
    }

    public boolean devOnly() {
        return this.devOnly;
    }

    /**
     * Cooldown in milliseconds
     */
    public long cooldown() {
        return this.cooldownMS;
    }

    // --------------------- Builder --------------------//
    @SuppressWarnings("unused")
    public static final class Builder {
        private String commandName;
        private String commandDescription = "No description provided";
        private String commandUsage = "No usage provided";
        private List<String> aliases = List.of();
        private EnumSet<Permission> userPermissions = EnumSet.noneOf(Permission.class);
        private EnumSet<Permission> botPermissions = EnumSet.noneOf(Permission.class);
        private boolean devOnly = false;
        private long cooldownMS = 0; // No cooldown by default

        public Builder name(String commandName) {
            if (commandName == null || commandName.isBlank())
                throw new IllegalArgumentException("Command name cannot be null or blank");
            this.commandName = commandName.trim();
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
            if (aliases == null || aliases.isEmpty()) {
                this.aliases = List.of();
                return this;
            }
            LinkedHashSet<String> seen = new LinkedHashSet<>();
            for (String a : aliases) {
                if (a == null)
                    continue;
                String t = a.trim();
                if (t.isEmpty())
                    continue;
                seen.add(t);
            }
            this.aliases = List.copyOf(seen);
            return this;
        }

        public Builder aliases(String... aliases) {
            if (aliases == null || aliases.length == 0)
                return aliases(List.of());
            return aliases(Arrays.asList(aliases));
        }

        public Builder userPermissions(Permission... permissions) {
            this.userPermissions = permissions == null ? EnumSet.noneOf(Permission.class)
                    : EnumSet.copyOf(Arrays.asList(permissions));
            return this;
        }

        public Builder botPermissions(Permission... permissions) {
            this.botPermissions = permissions == null ? EnumSet.noneOf(Permission.class)
                    : EnumSet.copyOf(Arrays.asList(permissions));
            return this;
        }

        public Builder devOnly(boolean devOnly) {
            this.devOnly = devOnly;
            return this;
        }

        public Builder cooldown(long seconds) {
            if (seconds < 0)
                throw new IllegalArgumentException("Cooldown cannot be negative");
            this.cooldownMS = seconds * 1000;
            return this;
        }

        public MessageCommandConfig build() {
            if (this.commandName == null || this.commandName.isBlank())
                throw new IllegalStateException("Command name is required (call name(...))");

            String cnLower = this.commandName.toLowerCase(Locale.ROOT);
            List<String> filtered = this.aliases.stream()
                    .filter(a -> !a.equalsIgnoreCase(cnLower))
                    .toList();

            this.aliases = List.copyOf(filtered);
            return new MessageCommandConfig(this);
        }
    }

    @Override
    public String toString() {
        return "MessageCommandConfig{name='%s', aliases=%s, devOnly=%s}".formatted(
                this.commandName, this.aliases, this.devOnly);
    }
}
