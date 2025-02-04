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

	GBFOptions(const std::string& token, bool debugger = false, uint32_t intents = dpp::i_default_intents)
		: token(token), debugger(debugger), intents(intents) {
	}
};

#endif