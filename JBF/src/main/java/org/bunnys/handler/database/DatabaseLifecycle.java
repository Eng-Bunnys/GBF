package org.bunnys.handler.database;

import org.bunnys.handler.database.DatabaseConnector;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.util.ArrayList;
import java.util.List;

public class DatabaseLifecycle {
    private final List<DatabaseConnector> connectors = new ArrayList<>();

    public void register(DatabaseConnector connector) {
        connectors.add(connector);
    }

    public void connectAll() {
        for (DatabaseConnector connector : connectors) {
            boolean ok = connector.connect();
            if (!ok) {
                Logger.warning(connector.name() + " failed to connect. Disabling interactions.");
            }
        }
    }

    public void disconnectAll() {
        for (DatabaseConnector connector : connectors) {
            connector.disconnect();
        }
    }
}
