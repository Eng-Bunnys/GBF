#ifndef ReadyEvent_H
#define ReadyEvent_H

#include "../Handler/Event Handler/EventHandler.h"
#include <dpp/dpp.h>
#include <iostream>
#include <iomanip>
#include <thread>

class ReadyEvent : public EventHandler
{
public:
    void registerEvent(dpp::cluster &client) override
    {
        client.on_ready([&client](const dpp::ready_t &event)
                        {
                            std::cout << client.me.username << " is ready!" << std::endl;

                            // Allow some time for shards to populate
                            std::this_thread::sleep_for(std::chrono::seconds(10));

                            std::cout << std::left << std::setw(20) << "Shard"
                                      << std::setw(15) << "Members"
                                      << std::setw(15) << "Servers" << std::endl;

                            std::cout << std::setfill('-') << std::setw(50) << "" << std::endl;
                            std::cout << std::setfill(' ');

                            for (auto &s : client.get_shards())
                            {
                                // Color members in green if more than 10, else red
                                std::string memberColor = s.second->get_member_count() > 10 ? "\033[1;32m" : "\033[1;31m";
                                // Color servers in green if more than 5, else red
                                std::string serverColor = s.second->get_guild_count() > 5 ? "\033[1;32m" : "\033[1;31m";

                                std::cout << std::left << std::setw(20) << s.first
                                          << memberColor << std::setw(15) << s.second->get_member_count()
                                          << "\033[0m" // Reset color
                                          << serverColor << std::setw(15) << s.second->get_guild_count()
                                          << "\033[0m"
                                          << std::endl;
                            }
                        });
    }
};

REGISTER_EVENT(ReadyEvent);

#endif // ReadyEvent_H