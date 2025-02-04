#include "GBF.h"

GBF::GBF(const GBFOptions& options)
	: options(options), client(nullptr)
{
	this->debugger = options.debugger;
}

bool GBF::login()
{
	try
	{
		this->client = new dpp::cluster(this->options.token);
		this->client->intents = this->options.intents;

		EventFactory::setGBF(this);
		EventHandler::setGBF(this);

		// Load all registered events
		this->events = EventFactory::createAll();

		if (this->options.debugger)
			std::cout << "Total Events Loaded: " << events.size() << std::endl;

		// Register events
		for (auto& event : events)
		{
			event->registerEvent(*client);
		}

		this->client->start(dpp::st_wait);

		return true;
	}
	catch (const std::exception& e)
	{
		std::cerr << "I ran into an error:\n" << e.what() << std::endl;
		return false;
	}
}