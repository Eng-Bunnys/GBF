#ifndef GBF_H
#define GBF_h

#include <string>
#include <vector>
#include <memory>
#include <dpp/dpp.h>

#include "Events/EventHandler.h"
#include "GBFOptions.h"

class GBF
{
private:
	dpp::cluster* client;
	std::vector<std::unique_ptr<EventHandler>> events;
	GBFOptions options;
public:
	/// Handler Options
	bool debugger;

	// explicit ensures that the constructor cannot be accidentally invoked
	explicit GBF(const GBFOptions& options);

	/** Login to the bot*/
	bool login();
};

#endif // !GBF_H