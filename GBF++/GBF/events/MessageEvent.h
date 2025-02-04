#ifndef MessageEvent_H
#define MessageEvent_H

#include "../Handler/Event Handler/EventHandler.h"

class MessageEvent : public EventHandler
{
public:
    void registerEvent(dpp::cluster& client) override
    {
        client.on_message_create([](const dpp::message_create_t& event)
            {
                std::cout << event.msg.content << std::endl;
                if (event.msg.content == "!ping") {
                    event.reply("Pong! 🏓");
                } });
    }
};

REGISTER_EVENT(MessageEvent);

#endif