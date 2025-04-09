#!/usr/bin/env node

const generateEnvExample = require("./index");
const args = process.argv.slice(2);

// Default options
const options = {
  envFile: ".env",
  outputFile: ".env.example",
  placeholder: "<YOUR_VALUE_HERE>",
};

// Parse command-line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--input" || args[i] === "-i") options.envFile = args[++i];
  if (args[i] === "--output" || args[i] === "-o")
    options.outputFile = args[++i];
  if (args[i] === "--placeholder" || args[i] === "-p")
    options.placeholder = args[++i];
}

// Run the generator with the parsed options
generateEnvExample(options.envFile, options.outputFile, options.placeholder);
