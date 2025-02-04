#ifndef HandlerMessageEvent_H
#define HandlerMessageEvent_H

#include "../Event Handler/EventHandler.h"
#include "../Command Handler/Message Handler/MessageCommandRegistry.h"
#include <dpp/dpp.h>

class MessageEventHandler : public EventHandler
{
public:
    void registerEvent(dpp::cluster &client) override
    {
        client.on_message_create([&client](const dpp::message_create_t &event)
                                 {
            std::string content = event.msg.content;

            std::vector<std::string> args;
            std::istringstream iss(content);
            std::string word;

            while (iss >> word) {
                args.push_back(word);
            }

            if (args.empty()) return;

            std::string commandName = args[0].substr(1); // Remove prefix (assumes prefix is 1 character)

            MessageCommand* command = MessageCommandRegistry::getInstance().getCommand(commandName);
            if (command) {
                command->execute(client, event, args); // Corrected: no dereferencing needed
            } });
    }
};

REGISTER_EVENT(MessageEventHandler);

#endif // HandlerMessageEvent_H
