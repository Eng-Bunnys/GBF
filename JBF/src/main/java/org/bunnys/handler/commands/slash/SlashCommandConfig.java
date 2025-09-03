package org.bunnys.handler.commands.slash;

import net.dv8tion.jda.api.interactions.commands.build.OptionData;
import java.util.*;

/**
 * A final, immutable configuration class for a JDA slash command
 * <p>
 * This class uses the builder design pattern to ensure thread safety and
 * simplify
 * the construction of complex objects
 * It encapsulates all the necessary attributes
 * for defining a slash command, including its name, description, and a list of
 * options
 * The use of {@code List.copyOf()} ensures that the internal list of options is
 * immutable after construction
 * </p>
 * <p>
 * This class is designed to be used in conjunction with a command handler to
 * register slash commands with Discord
 * </p>
 *
 * @author Bunny
 * @see net.dv8tion.jda.api.interactions.commands.build.SlashCommandData
 */
@SuppressWarnings("unused")
public final class SlashCommandConfig {
    private final String commandName;
    private final String commandDescription;
    private final List<OptionData> commandOptions;

    /**
     * Private constructor to enforce the use of the Builder
     *
     * @param builder The builder instance containing the configured command data
     * @throws NullPointerException if the command name or description is null
     */
    private SlashCommandConfig(Builder builder) {
        this.commandName = Objects.requireNonNull(builder.commandName, "Slash Command name is required.");
        this.commandDescription = Objects.requireNonNull(builder.commandDescription,
                "Slash Command description is required.");
        this.commandOptions = List.copyOf(builder.options);
    }

    /**
     * Gets the name of the slash command
     *
     * @return The command's name as a {@code String}
     */
    public String name() {
        return this.commandName;
    }

    /**
     * Gets the description of the slash command
     *
     * @return The command's description as a {@code String}
     */
    public String description() {
        return this.commandDescription;
    }

    /**
     * Gets an immutable list of the command's options
     *
     * @return An unmodifiable {@code List<OptionData>} of the command's options
     */
    public List<OptionData> options() {
        return this.commandOptions;
    }

    // --------------------- Builder --------------------//

    /**
     * A static, final builder class for {@link SlashCommandConfig}
     * <p>
     * This class provides a fluent API for setting the command's attributes
     * Each method
     * returns the builder itself, allowing for method chaining
     * It includes validation
     * checks to ensure that required fields are not null or blank
     * </p>
     */
    @SuppressWarnings("unused")
    public static final class Builder {
        private String commandName;
        private String commandDescription;
        private final List<OptionData> options = new ArrayList<>();

        /**
         * Sets the name of the slash command
         *
         * @param name The name to set. Must be non-null and non-blank
         * @return The current {@code Builder} instance
         * @throws IllegalArgumentException if the provided name is null or blank
         */
        public Builder name(String name) {
            if (name == null || name.isBlank())
                throw new IllegalArgumentException("Slash Command name cannot be empty");
            this.commandName = name.trim().toLowerCase(Locale.US);
            return this;
        }

        /**
         * Sets the description of the slash command
         *
         * @param description The description to set. Must be non-null and non-blank
         * @return The current {@code Builder} instance
         * @throws IllegalArgumentException if the provided description is null or blank
         */
        public Builder description(String description) {
            if (description == null || description.isBlank())
                throw new IllegalArgumentException("Slash Command description cannot be empty");
            this.commandDescription = description;
            return this;
        }

        /**
         * Adds a single option to the command
         *
         * @param option The {@link OptionData} to add. Must be non-null
         * @return The current {@code Builder} instance
         * @throws IllegalArgumentException if the provided option is null
         */
        public Builder addOption(OptionData option) {
            if (option == null)
                throw new IllegalArgumentException("Slash Command Option data cannot be null");
            this.options.add(option);
            return this;
        }

        /**
         * Adds a list of options to the command.
         *
         * @param optionList A {@code List} of {@link OptionData} to add. The list
         *                   itself can be null
         * @return The current {@code Builder} instance
         */
        public Builder addOptions(List<OptionData> optionList) {
            if (optionList != null)
                optionList.forEach(this::addOption);
            return this;
        }

        /**
         * Constructs and returns a new {@link SlashCommandConfig} object
         * <p>
         * This method performs the final validation and object creation
         * </p>
         *
         * @return A new, immutable {@link SlashCommandConfig} instance
         * @throws IllegalStateException if the command name or description has not been
         *                               set
         */
        public SlashCommandConfig build() {
            if (this.commandName == null || this.commandName.isBlank()) {
                throw new IllegalStateException("Command name must be set before building the config.");
            }
            if (this.commandDescription == null || this.commandDescription.isBlank()) {
                throw new IllegalStateException("Command description must be set before building the config.");
            }
            return new SlashCommandConfig(this);
        }
    }

    @Override
    public String toString() {
        return "SlashCommandConfig{name='%s', description='%s'}".formatted(this.commandName, this.commandDescription);
    }
}