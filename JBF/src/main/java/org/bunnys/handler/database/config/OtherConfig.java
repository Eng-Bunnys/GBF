package org.bunnys.handler.database.config;

import org.bunnys.handler.database.DatabaseConfig;
import org.bunnys.handler.database.DatabaseType;

public final class OtherConfig implements DatabaseConfig {
    private final String uri;

    public OtherConfig(String uri) {
        if (uri == null || uri.isBlank())
            throw new IllegalArgumentException("Custom DB type requires a URI");
        this.uri = uri;
    }

    @Override
    public DatabaseType type() { return DatabaseType.OTHER; }
    @Override
    public String URI() { return uri; }
    @Override
    public String name() { return null; }
}
