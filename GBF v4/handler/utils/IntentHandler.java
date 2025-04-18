package org.bunnys.handler.utils;

import net.dv8tion.jda.api.requests.GatewayIntent;

import java.util.EnumSet;
import java.util.List;

public class IntentHandler {
    public static List<GatewayIntent> fromRaw(int bitfield) {
        EnumSet<GatewayIntent> enabled = EnumSet.noneOf(GatewayIntent.class);
        for (GatewayIntent intent : GatewayIntent.values())
            if ((bitfield & intent.getRawValue()) != 0)
                enabled.add(intent);

        return List.copyOf(enabled);
    }
}
