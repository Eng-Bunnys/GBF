package org.bunnys.handler.database.config;

import org.bunnys.handler.database.DatabaseConfig;
import org.bunnys.handler.database.DatabaseType;

public final class MongoConfig implements DatabaseConfig {
    private final String uri;

    public MongoConfig(String uri) {
        if (uri == null || uri.isBlank())
            throw new IllegalArgumentException("MongoDB requires a valid URI");
        this.uri = uri;
    }

    @Override
    public DatabaseType type() { return DatabaseType.MONGODB; }

    @Override
    public String URI() { return this.uri; }

    @Override
    public String name() { return null; } // Mongo doesn't need explicit DB name
}
