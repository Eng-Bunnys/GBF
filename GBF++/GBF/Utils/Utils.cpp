#include "Utils.h"

// Converts a string to lowercase
std::string Utils::toLowerCase(const std::string& str) {
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(), ::tolower);
    return result;
}

// Trims whitespace from both ends of a string
std::string Utils::trim(const std::string& str) {
    size_t start = str.find_first_not_of(" \t\n\r");
    size_t end = str.find_last_not_of(" \t\n\r");
    return (start == std::string::npos) ? "" : str.substr(start, end - start + 1);
}

// Checks if a string starts with a given prefix
bool Utils::startsWith(const std::string& str, const std::string& prefix) {
    return str.rfind(prefix, 0) == 0;
}