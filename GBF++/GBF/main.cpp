// Handler Imports
#include "Handler/GBF.h"
#include "Utils/EnvReader/EnvReader.h"

int main()
{
	try
	{
		EnvReader env(".env");
		std::string botToken = env.get("TOKEN");

		uint32_t intents = dpp::i_all_intents;

		GBFOptions options(botToken, true, true, intents);

		GBF client(options);

		bool loggedIn = client.login();

		if (!loggedIn)
			return EXIT_FAILURE;
	}
	catch (const std::exception &e)
	{
		std::cerr << "I ran into an error\n"
				  << e.what() << std::endl;
		return EXIT_FAILURE;
	}
	return EXIT_SUCCESS;
}