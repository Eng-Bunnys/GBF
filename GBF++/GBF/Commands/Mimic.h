#ifndef MimicCommand_H
#define MimicCommand_H

#include "../Handler/Command Handler/Message Handler/MessageCommandRegistry.h"

class MimicCommand : public MessageCommand
{
public:
    MimicCommand() : MessageCommand({ "mimic", "Mimic a message.", {"m"} }) {}

    void execute(dpp::cluster& client, const dpp::message_create_t& message, const std::vector<std::string>& args) override
    {
        if (args.size() <= 1) 
            return message.reply("Enter the text to mimic."); 

        std::string result;
        for (size_t i = 1; i < args.size(); ++i) 
            result += args[i] + " ";

        result.pop_back();

        message.reply(result, true);
    }
};

REGISTER_COMMAND(MimicCommand);

#endif // MimicCommand_H
