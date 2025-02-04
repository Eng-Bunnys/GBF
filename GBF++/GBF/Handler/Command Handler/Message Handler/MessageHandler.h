#ifndef MessageHandler_H
#define MessageHandler_H

#include <dpp/dpp.h>
#include <string>
#include <vector>

class MessageCommandRegistry;

class MessageCommand
{
public:
    std::string name;

    explicit MessageCommand(const std::string &name) : name(name) {}

    virtual void execute(dpp::cluster &client,
                         const dpp::message_create_t &event,
                         const std::vector<std::string> &args) = 0;

    virtual ~MessageCommand() = default;
};

#endif // MessageHandler_H