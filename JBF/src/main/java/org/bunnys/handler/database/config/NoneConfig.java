package org.bunnys.handler.database.config;

import org.bunnys.handler.database.DatabaseConfig;
import org.bunnys.handler.database.DatabaseType;

/**
 * Represents the absence of a database.
 * Used as the default implementation when no database is configured.
 */
public final class NoneConfig implements DatabaseConfig {
    @Override
    public DatabaseType type() {
        return DatabaseType.NONE;
    }

    @Override
    public String URI() {
        return null; // No connection string
    }

    @Override
    public String name() {
        return null; // No name
    }
}