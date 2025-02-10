#ifndef MessageHandler_H
#define MessageHandler_H

#include <dpp/dpp.h>
#include <string>
#include <vector>
#include <stdexcept>

class MessageCommandRegistry;
struct CommandOptions
{
    std::string name;
    std::string description;
    std::vector<std::string> aliases;
};

class MessageCommand
{
public:
    CommandOptions options;

    explicit MessageCommand(const CommandOptions &opts) : options(opts) {}

    virtual void execute(dpp::cluster &client,
                         const dpp::message_create_t &event,
                         const std::vector<std::string> &args) = 0;

    virtual ~MessageCommand() = default;
};

#endif // MessageHandler_H