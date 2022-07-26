const fs = require("fs");

function getAllFiles(path) {
  const files = fs.readdirSync(path, {
    withFileTypes: true,
  });
  let commandFiles = [];

  for (const file of files) {
    const fileName = `${path}\\${file.name}`;

    if (file.isDirectory()) {
      commandFiles = [...commandFiles, ...getAllFiles(fileName)];
      continue;
    }

    commandFiles.push(fileName);
  }

  return commandFiles;
}

/**
 * Function to set a timeout
 * Can be used in loops
 * @param {number} ms - Time to wait in milliseconds
 * @return {promise}

 * @example await delay(5000)
 */
 function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  getAllFiles,
  delay
};
