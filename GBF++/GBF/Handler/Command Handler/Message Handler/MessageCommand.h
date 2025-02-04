#ifndef MessageCommand_H
#define MessageCommand_H

#include <string>
#include <vector>
#include <unordered_map>
#include <functional>
#include <memory>
#include <dpp/dpp.h>

class MessageCommand {
public:
    std::string name;
    std::string description;
    std::vector<std::string> aliases;
    std::vector<std::string> userPermissions;
    std::vector<std::string> botPermissions;
    std::string category;
    int cooldown; 

    MessageCommand(std::string name, std::string description, std::vector<std::string> aliases = {}, int cooldown = 5)
        : name(std::move(name)), description(std::move(description)), aliases(std::move(aliases)), cooldown(cooldown) {
    }

    virtual ~MessageCommand() = default;

    virtual void execute(const dpp::message_create_t& event) = 0;
};

#endif // MessageCommand_H
