#ifndef PINGCOMMAND_H
#define PINGCOMMAND_H

#include "../Handler/Command Handler/Message Handler/MessageCommandRegistry.h"
class PingCommand : public MessageCommand
{
public:
    PingCommand() : MessageCommand("ping") {}

    void execute(dpp::cluster &client, const dpp::message_create_t &event, const std::vector<std::string> &args) override
    {
        std::cout << "[DEBUG] PingCommand executed." << std::endl;
        event.reply("Pong! Test");
    }
};

REGISTER_COMMAND(PingCommand);

#endif // PINGCOMMAND_H
