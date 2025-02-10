#include "MessageCommandRegistry.h"
#include "../../GBF.h"

// MessageCommandRegistry implementation
MessageCommandRegistry &MessageCommandRegistry::getInstance()
{
    static MessageCommandRegistry instance;
    return instance;
}

void MessageCommandRegistry::setGBF(GBF *instance)
{
    this->gbf = instance;
}

void MessageCommandRegistry::registerCommand(std::unique_ptr<MessageCommand> command)
{
    if (!command)
        return;

    std::string commandName = command->options.name;
    if (this->commands.find(commandName) != this->commands.end())
    {
        throw std::runtime_error("Command already registered: " + commandName);
    }
    this->commands[commandName] = std::move(command);

    if (this->gbf && this->gbf->debugger)
    {
        std::cout << "Command registered: " << commandName << std::endl;
        std::cout << "Total Commands Loaded: " << this->commands.size() << std::endl;
    }
}

MessageCommand *MessageCommandRegistry::getCommand(const std::string &commandName)
{
    auto it = this->commands.find(commandName);
    return (it != this->commands.end()) ? it->second.get() : nullptr;
}

const std::unordered_map<std::string, std::unique_ptr<MessageCommand>> &MessageCommandRegistry::getCommands() const
{
    return commands;
}

// CommandFactory implementation
std::unordered_map<std::string, std::function<std::unique_ptr<MessageCommand>()>> CommandFactory::commandRegistry;
GBF *CommandFactory::gbf = nullptr;

void CommandFactory::registerCommand(const std::string &name, std::function<std::unique_ptr<MessageCommand>()> constructor)
{
    commandRegistry[name] = constructor;
}

std::vector<std::unique_ptr<MessageCommand>> CommandFactory::createAll()
{
    std::vector<std::unique_ptr<MessageCommand>> commands;
    for (const auto &pair : commandRegistry)
    {
        commands.push_back(pair.second());
    }
    return commands;
}

void CommandFactory::setGBF(GBF *instance)
{
    gbf = instance;
}