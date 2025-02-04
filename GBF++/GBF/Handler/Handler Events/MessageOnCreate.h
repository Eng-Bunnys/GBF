#ifndef HandlerMessageEvent_H
#define HandlerMessageEvent_H

#include "../Event Handler/EventHandler.h"
#include "../Command Handler/Message Handler/CommandFactory.h"
#include <dpp/dpp.h>

class MessageEvent : public EventHandler {
public:
    void registerEvent(dpp::cluster& client) override;
};

REGISTER_EVENT(MessageEvent);

#endif // HandlerMessageEvent_H
