#ifndef ENVREADER_H
#define ENVREADER_H

#include <string>
#include <map>
#include <fstream>
#include <iostream>

class EnvReader {
private:
    std::string filename;
    std::map<std::string, std::string> envVariables;

    void loadEnvFile();

public:
    EnvReader(const std::string& envFile);
    std::string get(const std::string& key) const;
};

#endif