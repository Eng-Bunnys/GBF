package org.bunnys.handler.database;

public interface DatabaseConnector {
    boolean connect();
    void disconnect();
    boolean isConnected();
    String name();
}
