#include "GBF.h"

GBF::GBF(const GBFOptions &options)
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

        // Set up factories
        EventFactory::setGBF(this);
        CommandFactory::setGBF(this);
        MessageCommandRegistry::getInstance().setGBF(this);

        // Load events
        this->events = EventFactory::createAll();

        // Load commands if enabled
        if (this->options.registerCommands)
        {
            auto commands = CommandFactory::createAll();
            for (auto &cmd : commands)
            {
                MessageCommandRegistry::getInstance().registerCommand(std::move(cmd));
            }
        }

        if (this->options.debugger)
        {
            std::cout << "Total Events Loaded: " << events.size() << std::endl;
            std::cout << "Commands Enabled: " << (this->options.registerCommands ? "Yes" : "No") << std::endl;
        }

        // Register events
        for (auto &event : events)
        {
            event->registerEvent(*client);
        }

        this->client->start(dpp::st_wait);
        return true;
    }
    catch (const std::exception &e)
    {
        std::cerr << "Error during login:\n"
                  << e.what() << std::endl;
        return false;
    }
}