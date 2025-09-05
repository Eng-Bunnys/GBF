package org.bunnys.handler.database;

public interface DatabaseConfig {
    DatabaseType type();
    String URI();
    String name();
}
