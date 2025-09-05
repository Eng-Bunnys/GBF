package org.bunnys.handler.database.config;

import org.bunnys.handler.database.DatabaseConfig;
import org.bunnys.handler.database.DatabaseType;

public final class SQLConfig implements DatabaseConfig {
    private final DatabaseType type;
    private final String uri;
    private final String name;

    public SQLConfig(DatabaseType type, String uri, String name) {
        if (type != DatabaseType.MYSQL && type != DatabaseType.POSTGRESQL && type != DatabaseType.SQLITE)
            throw new IllegalArgumentException("SqlConfig only supports MYSQL/POSTGRES/SQLITE");
        if (uri == null || uri.isBlank())
            throw new IllegalArgumentException(type + " requires a valid URI");
        if (name == null || name.isBlank())
            throw new IllegalArgumentException(type + " requires a valid database name");

        this.type = type;
        this.uri = uri;
        this.name = name;
    }

    @Override
    public DatabaseType type() { return type; }
    @Override
    public String URI() { return uri; }
    @Override
    public String name() { return name; }
}
