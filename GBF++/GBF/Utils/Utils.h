#ifndef Utils_H
#define Utils_H

#include <string>
#include <algorithm>

namespace Utils {
	// Converts a string to lowercase
	std::string toLowerCase(const std::string& str);

	// Trims whitespace from both ends of a string
	std::string trim(const std::string& str);

	// Checks if a string starts with a given prefix
	bool startsWith(const std::string& str, const std::string& prefix);
} 

#endif // Utils_H