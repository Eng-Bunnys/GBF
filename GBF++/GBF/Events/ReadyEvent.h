#ifndef ReadyEvent_H
#define ReadyEvent_H

#include "../Handler/Event Handler/EventHandler.h"
#include <dpp/dpp.h>
#include <iostream>
#include <iomanip>

class ReadyEvent : public EventHandler
{
public:
    void registerEvent(dpp::cluster &client) override
    {
        client.on_ready([&client](const dpp::ready_t &event)
                        { std::cout << client.me.username << " is ready!" << std::endl; });
    }
};

REGISTER_EVENT(ReadyEvent);

#endif // ReadyEvent_H