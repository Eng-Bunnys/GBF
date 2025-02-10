#ifndef ColorCodes_H
#define ColorCodes_H

#include <string>
#include <sstream>
#include <iomanip>

namespace ColorCodes {
    const std::string Default = "#e91e63";
    const std::string ErrorRed = "#FF0000";
    const std::string SuccessGreen = "#33a532";
    const std::string SalmonPink = "#ff91a4";
    const std::string CardinalRed = "#C41E3A";
    const std::string Cherry = "#D2042D";
    const std::string PastelRed = "#FAA0A0";
    const std::string Cyan = "#00FFFF";

    uint32_t ColorResolvable(const std::string& hex) {
        uint32_t color;
        std::stringstream ss;
        ss << std::hex << hex.substr(1);  
        ss >> color;
        return color;
    }
}

#endif // !ColorCodes_H
