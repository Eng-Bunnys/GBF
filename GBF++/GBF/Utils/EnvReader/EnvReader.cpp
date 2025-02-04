#include "EnvReader.h"
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <algorithm>
#include <cctype>

static std::string trim(const std::string& s) {
    auto start = s.begin();
    while (start != s.end() && std::isspace(*start)) {
        ++start;
    }
    auto end = s.end();
    do {
        --end;
    } while (std::distance(start, end) > 0 && std::isspace(*end));
    return std::string(start, end + 1);
}

void EnvReader::loadEnvFile() {
    std::ifstream file(filename);
    if (!file) {
        throw std::runtime_error("Error: Could not open " + filename);
    }

    std::string line;
    int lineNumber = 0;
    while (std::getline(file, line)) {
        ++lineNumber;
        std::string trimmedLine = trim(line);

        // Skip empty lines and comment lines starting with '#'
        if (trimmedLine.empty() || trimmedLine[0] == '#') {
            continue;
        }

        size_t pos = trimmedLine.find('=');
        if (pos != std::string::npos) {
            std::string key = trim(trimmedLine.substr(0, pos));
            std::string value = trim(trimmedLine.substr(pos + 1));
            envVariables[key] = value;
        }
        else {
            throw std::runtime_error("Error: Malformed line " + std::to_string(lineNumber) + ": " + line);
        }
    }
}

EnvReader::EnvReader(const std::string& envFile) : filename(envFile) {
    loadEnvFile();
}

std::string EnvReader::get(const std::string& key) const {
    auto it = envVariables.find(key);
    if (it == envVariables.end() || it->second.empty()) {
        throw std::runtime_error("Error: Environment variable '" + key + "' not found or is empty.");
    }
    return it->second;
}