#ifndef PingCommand_H
#define PingCommand_H

#include "../Handler/Command Handler/Message Handler/MessageCommandRegistry.h"
#include "../../../Utils/UI Resources/ColorCodes.h"

class PingCommand : public MessageCommand
{
public:
    PingCommand() : MessageCommand({ "ping", "Responds with Pong and bot's REST latency.", {"p"} }) {}

    void execute(dpp::cluster& client, const dpp::message_create_t& message, const std::vector<std::string>& args) override
    {
        // Gets the bot's REST latency in milliseconds
        int64_t latency = static_cast<int64_t>(client.rest_ping * 1000); 

        dpp::embed embed;
        embed.set_title("Pong 🏓")
            .add_field("Latency", std::to_string(latency) + " ms")
            .set_color(ColorCodes::ColorResolvable(ColorCodes::Default))
            .set_footer("", message.msg.author.get_avatar_url());

        message.reply(embed, true);
    }
};

REGISTER_COMMAND(PingCommand);

#endif // PingCommand_H
