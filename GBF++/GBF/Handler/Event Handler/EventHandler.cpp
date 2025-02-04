#include "EventHandler.h"
#include "../GBF.h"
#include <iostream>

GBF* EventHandler::gbf = nullptr;
GBF* EventFactory::gbf = nullptr;

std::unordered_map<std::string, std::function<std::unique_ptr<EventHandler>()>> EventFactory::eventRegistry;

void EventFactory::registerEvent(const std::string& name, std::function<std::unique_ptr<EventHandler>()> constructor)
{
    eventRegistry[name] = constructor;

    if (gbf && gbf->debugger)
        std::cout << "Registered event: " << name << std::endl;
}

std::vector<std::unique_ptr<EventHandler>> EventFactory::createAll()
{
    std::vector<std::unique_ptr<EventHandler>> events;
    for (const auto& [name, constructor] : eventRegistry)
    {
        std::cout << "Registering Event: " << name << std::endl;
        events.push_back(constructor());
    }
    return events;
}
