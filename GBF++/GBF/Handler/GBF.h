#ifndef GBF_H
#define GBF_h

#include <string>
#include <vector>
#include <memory>
#include <dpp/dpp.h>

#include "../Handler/Event Handler/EventHandler.h"
#include "../Handler/Command Handler/Message Handler/MessageCommandRegistry.h"
#include "../Handler/Command Handler/Message Handler/MessageHandler.h"

#include "GBFOptions.h"

class GBF
{
private:
	dpp::cluster *client;
	std::vector<std::unique_ptr<EventHandler>> events;
	GBFOptions options;

public:
	/// Handler Options
	bool debugger;

	// explicit ensures that the constructor cannot be accidentally invoked
	explicit GBF(const GBFOptions &options);

	/** Login to the bot*/
	bool login();
};

#endif // !GBF_H