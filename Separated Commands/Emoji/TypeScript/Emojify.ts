  options: [
    {
      name: "text",
      description: "The text you want to turn into emojis",
      type: Constants.ApplicationCommandOptionTypes.STRING,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
  ]

    const userInput = interaction.options.getString("text", true);
 
    const numbersObj = {
      " ": "   ",
      "0": ":zero:",
      "1": ":one:",
      "2": ":two:",
      "3": ":three:",
      "4": ":four:",
      "5": ":five:",
      "6": ":six:",
      "7": ":seven:",
      "8": ":eight:",
      "9": ":nine:",
      "!": ":grey_exclamation:",
      "?": ":grey_question:",
      "#": ":hash:",
      "*": ":asterisk:",
    };

    "abcdefghijklmnopqrstuvwxyz".split("").forEach((letter) => {
      numbersObj[letter as keyof typeof numbersObj] = numbersObj[
        letter.toUpperCase() as keyof typeof numbersObj
      ] = ` :regional_indicator_${letter}:`;
    });

    return interaction.reply({
        content: `${userInput.split('').map(c => numbersObj[c as keyof typeof numbersObj] || c).join('')}`
    })
