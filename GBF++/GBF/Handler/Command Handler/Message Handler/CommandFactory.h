#ifndef MessageCommandFactory_H
#define MessageCommandFactory_H

#include "MessageCommand.h"
#include <unordered_map>
#include <memory>

class CommandFactory {
private:
    static std::unordered_map<std::string, std::unique_ptr<MessageCommand>> commands;

public:
    static void registerCommand(std::unique_ptr<MessageCommand> command) {
        commands[command->name] = std::move(command);
    }

    static MessageCommand* getCommand(const std::string& name) {
        auto it = commands.find(name);
        if (it != commands.end()) {
            return it->second.get();
        }
        return nullptr;
    }

    static const std::unordered_map<std::string, std::unique_ptr<MessageCommand>>& getAllCommands() {
        return commands;
    }
};

std::unordered_map<std::string, std::unique_ptr<MessageCommand>> CommandFactory::commands;

#endif // MessageCommandFactory_H
