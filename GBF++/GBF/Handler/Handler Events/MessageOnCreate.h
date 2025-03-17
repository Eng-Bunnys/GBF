#ifndef HandlerMessageEvent_H
#define HandlerMessageEvent_H

#include "../Event Handler/EventHandler.h"
#include "../Command Handler/Message Handler/MessageCommandRegistry.h"
#include "../../Utils/Utils.h"
#include <dpp/dpp.h>

class MessageEventHandler : public EventHandler
{
public:
    void registerEvent(dpp::cluster &client) override
    {
        client.on_message_create([&client](const dpp::message_create_t &event)
                                 {
         
                std::string messageContent = event.msg.content;
                std::string lowerCaseContent = messageContent; // Preserve original content
                Utils::toLowerCase(lowerCaseContent);

                std::vector<std::string> argsLower;
                std::vector<std::string> args;
                std::istringstream issLower(lowerCaseContent);
                std::istringstream issOriginal(messageContent);
                std::string wordLower, wordOriginal;

                while (issLower >> wordLower && issOriginal >> wordOriginal) {
                    argsLower.push_back(wordLower);
                    args.push_back(wordOriginal); // Preserve original case
                }

                if (argsLower.empty() 
                    || args.empty()) return;

                std::string commandName = argsLower[0].substr(1); // Remove prefix (assumes prefix is 1 character)

                MessageCommand* command = MessageCommandRegistry::getInstance().getCommand(commandName);
                if (!command) {
                    const auto& commandRegistry = MessageCommandRegistry::getInstance().getCommands();
                    for (const auto& pair : commandRegistry) {
                        const CommandOptions& opts = pair.second->options;
                        if (std::find(opts.aliases.begin(), opts.aliases.end(), commandName) != opts.aliases.end()) {
                            command = pair.second.get();
                            break;
                        }
                    }
                }

                if (command) {
                    command->execute(client, event, args);
                } });
    }
};

REGISTER_EVENT(MessageEventHandler);

#endif // HandlerMessageEvent_H
