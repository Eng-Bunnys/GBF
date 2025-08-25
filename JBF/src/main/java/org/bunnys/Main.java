package org.bunnys;

import org.bunnys.handler.Config;
import org.bunnys.handler.JBF;

public class Main {
    public static void main(String[] args) {
        Config config = Config.builder()
                .version("2.0.0")
                .debug(true)
                .eventsPackage("org.bunnys.events")
                .build();

        JBF client = new JBF(config);
    }
}