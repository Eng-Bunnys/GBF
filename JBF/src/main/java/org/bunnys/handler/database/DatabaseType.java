package org.bunnys.handler.database;

/**
 * Represents the types of databases supported by the application
 * This enum is used to specify the database type being handled
 */
public enum DatabaseType {
    /**
     * Represents no database type
     */
    NONE,

    /**
     * Represents a MongoDB database
     */
    MONGODB,

    /**
     * Represents a MySQL database
     */
    MYSQL,

    /**
     * Represents a PostgresSQL database
     */
    POSTGRESQL,

    /**
     * Represents an SQLite database
     */
    SQLITE,

    /**
     * Represents any other database type not explicitly listed
     */
    OTHER
}