#ifndef MessageCommandRegistry_H
#define MessageCommandRegistry_H

#include "MessageHandler.h"
#include <unordered_map>
#include <memory>
#include <iostream>
#include <functional>

class GBF;

class MessageCommandRegistry
{
private:
    std::unordered_map<std::string, std::unique_ptr<MessageCommand>> commands;
    GBF *gbf;

public:
    static MessageCommandRegistry &getInstance();
    void setGBF(GBF *instance);
    void registerCommand(std::unique_ptr<MessageCommand> command);
    MessageCommand *getCommand(const std::string &commandName);
};

class CommandFactory
{
private:
    static std::unordered_map<std::string, std::function<std::unique_ptr<MessageCommand>()>> commandRegistry;
    static GBF *gbf;

public:
    static void registerCommand(const std::string &name, std::function<std::unique_ptr<MessageCommand>()> constructor);
    static std::vector<std::unique_ptr<MessageCommand>> createAll();
    static void setGBF(GBF *instance);
};

#define REGISTER_COMMAND(CommandClass) \
    static bool CommandClass##Registered = [] { \
        CommandFactory::registerCommand(#CommandClass, [] { return std::make_unique<CommandClass>(); }); \
        return true; }();

#endif // MessageCommandRegistry_H