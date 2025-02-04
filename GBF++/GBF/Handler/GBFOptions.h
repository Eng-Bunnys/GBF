#ifndef GBF_Config_H
#define GBF_Config_H

#include <string>

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

	GBFOptions(const std::string &token, bool debugger = false, bool registerCommands = true, uint32_t intents = dpp::i_default_intents)
		: token(token), debugger(debugger), intents(intents), registerCommands(registerCommands)
	{
	}
};

#endif