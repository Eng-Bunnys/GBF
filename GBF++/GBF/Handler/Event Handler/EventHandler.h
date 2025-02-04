#ifndef EventHandler_H
#define EventHandler_H

#include <dpp/dpp.h>
#include <memory>
#include <unordered_map>
#include <string>

class GBF;
class EventHandler
{
protected:
	static GBF* gbf;

public:
	virtual void registerEvent(dpp::cluster& client) = 0;
	virtual ~EventHandler() = default;

	static void setGBF(GBF* instance) { gbf = instance; }
};

class EventFactory
{
private:
	static std::unordered_map<std::string, std::function<std::unique_ptr<EventHandler>()>> eventRegistry;
	static GBF* gbf;

public:
	static void registerEvent(const std::string& name, std::function<std::unique_ptr<EventHandler>()> constructor);
	static std::vector<std::unique_ptr<EventHandler>> createAll();
	static void setGBF(GBF* instance) { gbf = instance; }
};

// Macro for auto-registering events
#define REGISTER_EVENT(EventClass) \
	static bool EventClass##Registered = [] { \
        EventFactory::registerEvent(#EventClass, [] { return std::make_unique<EventClass>(); }); \
        return true; }();

#endif