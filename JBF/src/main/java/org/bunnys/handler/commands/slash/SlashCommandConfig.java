package org.bunnys.handler.commands.slash;

import net.dv8tion.jda.api.interactions.commands.build.OptionData;

import javax.swing.text.html.Option;
import java.util.*;

public class SlashCommandConfig {
    private final String commandName;
    private final String commandDescription;
    private final List<OptionData> commandOptions;

    private SlashCommandConfig(Builder builder) {
        this.commandName = Objects.requireNonNull(builder.commandName, "Slash Command name is required.");
        this.commandDescription = Objects.requireNonNull(builder.commandDescription, "Slash Command description is required.");
        this.commandOptions = List.copyOf(builder.options);
    }

    public String name() {
        return this.commandName;
    }

    public String description() {
        return this.commandDescription;
    }

    public List<OptionData> options() {
        return this.commandOptions;
    }

    // --------------------- Builder --------------------//
    public static final class Builder {
        private String commandName;
        private String commandDescription;
        private final List<OptionData> options = new ArrayList<>();

        public Builder name(String name) {
            if (name == null || name.isBlank())
                throw new IllegalArgumentException("Slash Command name cannot be empty");
            this.commandName = name.trim().toLowerCase(Locale.US);
            return this;
        }

        public Builder description(String description) {
            if (description == null || description.isBlank())
                throw new IllegalArgumentException("Slash Command description cannot be empty");
            this.commandDescription = description;
            return this;
        }

        public Builder addOption(OptionData option) {
            if (option == null)
                throw new IllegalArgumentException("Slash Command Option data cannot be null");
            this.options.add(option);
            return this;
        }

        public Builder addOptions(List<OptionData> optionList) {
            if (optionList != null)
                optionList.forEach(this::addOption);
            return this;
        }

        public SlashCommandConfig build() {
            return new SlashCommandConfig(this);
        }
    }

    @Override
    public String toString() {
        return "SlashCommandConfig{name='%s', description='%s'}".formatted(this.commandName, this.commandDescription);
    }
}
