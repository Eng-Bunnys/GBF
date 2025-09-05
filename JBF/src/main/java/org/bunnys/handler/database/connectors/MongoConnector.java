package org.bunnys.handler.database.connectors;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bunnys.handler.database.DatabaseConnector;
import org.bunnys.handler.utils.handler.logging.Logger;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
//TODO: Clean up, I CBA to fix clean this rn
public class MongoConnector implements DatabaseConnector {
    private final String URI;
    private MongoClient client;
    private final AtomicBoolean connected = new AtomicBoolean(false);

    public MongoConnector(String URI) {
        this.URI = URI;
    }

    @Override
    public boolean connect() {
        if (this.URI == null || this.URI.isBlank()) {
            Logger.warning("No MongoDB URI provided.");
            return false;
        }

        try {
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(this.URI))
                    .applyToSocketSettings(builder -> builder.connectTimeout(30_000, TimeUnit.MILLISECONDS))
                    .applyToClusterSettings(builder -> builder.serverSelectionTimeout(30_000, TimeUnit.MILLISECONDS))
                    .build();

            this.client = MongoClients.create(settings);

            this.client.getDatabase("admin").runCommand(new org.bson.Document("ping", 1));

            this.connected.set(true);
            Logger.info("Connected to Mongoose");

//            MongoDatabase db = client.getDatabase("bunnynexus");
//            MongoCollection<Document> col = db.getCollection("connection_test");
//
//            col.insertOne(new Document("ping", true).append("ts", System.currentTimeMillis()));
//
//            Document found = col.find(new Document("ping", true)).first();
//            System.out.println(found != null ? "Mongo write/read test passed: " + found.toJson() : "Mongo test failed");

            return true;
        } catch (Exception error) {
            Logger.error("Couldn't connect to MongoDB: " + error.getMessage());
            connected.set(false);
            return false;
        }
    }

    @Override
    public void disconnect() {
        if (this.client != null) {
            this.client.close();
            this.connected.set(false);
        }
    }

    @Override
    public boolean isConnected() {
        return this.connected.get();
    }

    @Override
    public String name() {
        return "MongoDB";
    }
}
