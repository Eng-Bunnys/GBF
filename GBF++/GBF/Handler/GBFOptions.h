#ifndef GBF_Config_H
#define GBF_Config_H

#include <string>
#include <dpp/dpp.h>
#include <stdexcept>
#include <bitset>

struct GBFOptions
{
    /** The bot's private token */
    std::string token;
    /** When true, handler logs will print */
    bool debugger;
    /** The bots intents */
    uint32_t intents;
    /** When true, the handler will register commands*/
    bool registerCommands;
    /** The bot's prefix*/
    std::string prefix;

    GBFOptions()
        : debugger(false),
          registerCommands(true),
          intents(dpp::i_default_intents),
          token(""),
          prefix("!")
    {
    }

    GBFOptions &setToken(const std::string &t)
    {
        if (t.empty())
            throw std::invalid_argument("A token must be given to start the bot.");

        this->token = t;
        return *this;
    }

    GBFOptions &setPrefix(const std::string &p)
    {
        if (p.empty())
            throw std::invalid_argument("Prefix cannot be empty.");

        if (p.length() > 5)
            throw std::invalid_argument("Prefix length should not exceed 5 characters.");

        this->prefix = p;
        return *this;
    }

    GBFOptions &setDebugger(bool d)
    {
        this->debugger = d;
        return *this;
    }

    GBFOptions &setRegisterCommands(bool r)
    {
        this->registerCommands = r;
        return *this;
    }
    GBFOptions &setIntents(uint32_t i)
    {
        static constexpr uint32_t valid_intents =
            dpp::i_guilds | dpp::i_guild_members | dpp::i_guild_bans | dpp::i_guild_emojis |
            dpp::i_guild_integrations | dpp::i_guild_webhooks | dpp::i_guild_invites |
            dpp::i_guild_voice_states | dpp::i_guild_presences | dpp::i_guild_messages |
            dpp::i_guild_message_reactions | dpp::i_guild_message_typing | dpp::i_direct_messages |
            dpp::i_direct_message_reactions | dpp::i_direct_message_typing | dpp::i_message_content |
            dpp::i_guild_scheduled_events | dpp::i_auto_moderation_configuration |
            dpp::i_auto_moderation_execution;

        if (i != 0 && (i & ~valid_intents) != 0)
        {
            std::bitset<32> invalid_intents(i & ~valid_intents);
            throw std::invalid_argument("Invalid intent flag(s) specified: " + invalid_intents.to_string());
        }

        this->intents = i;
        return *this;
    }
};

#endif