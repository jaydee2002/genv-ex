const fs = require("fs").promises;
const path = require("path");
const dotenv = require("dotenv");

/**
 * Generates an example .env file with advanced configuration options
 * @param {Object} options - Configuration options
 * @param {string} options.envFilePath - Source .env file path
 * @param {string} options.outputFilePath - Output example file path
 * @param {string} options.placeholder - Default placeholder for values
 * @param {string[]} options.preserveValues - Keys whose values should be preserved
 * @param {boolean} options.includeComments - Whether to preserve comments
 * @param {string} options.header - Custom header text
 * @returns {Promise<void>}
 */
async function generateEnvExample({
  envFilePath = ".env",
  outputFilePath = ".env.example",
  placeholder = "<YOUR_VALUE_HERE>",
  preserveValues = [],
  includeComments = true,
  header = "# Generated .env.example\n# Auto-generated on " +
    new Date().toISOString() +
    "\n",
} = {}) {
  try {
    // Resolve full paths
    const envPath = path.resolve(process.cwd(), envFilePath);
    const outputPath = path.resolve(process.cwd(), outputFilePath);

    // Check if source file exists
    try {
      await fs.access(envPath);
    } catch {
      console.log(
        `No '${envFilePath}' file found in the current directory. Skipping generation.`
      );
      return;
    }

    // Check if output file already exists
    try {
      await fs.access(outputPath);
      console.log(`'${outputFilePath}' already exists. Skipping generation.`);
      return;
    } catch {
      // File doesn't exist, proceed with generation
    }

    // Read the .env file
    const envContent = await fs.readFile(envPath, "utf8");

    // Parse the content line by line to preserve comments and structure
    const lines = envContent.split("\n");
    let exampleContent = header;
    const parsedEnv = dotenv.parse(envContent);

    // Process each line
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines (preserve them in output)
      if (!trimmedLine) {
        exampleContent += "\n";
        continue;
      }

      // Handle comments
      if (trimmedLine.startsWith("#") && includeComments) {
        exampleContent += `${line}\n`;
        continue;
      }

      // Handle key-value pairs
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const shouldPreserve = preserveValues.includes(key);
        const value = shouldPreserve ? parsedEnv[key] : placeholder;
        exampleContent += `${key}=${value}\n`;
      }
    }

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write the output file
    await fs.writeFile(outputPath, exampleContent, "utf8");
    console.log(`Successfully generated '${outputFilePath}'`);
  } catch (error) {
    const errorMessage =
      error.code === "ENOENT"
        ? `File system error: ${error.message}`
        : `Failed to generate example file: ${error.message}`;

    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

// Example usage
async function runExample() {
  await generateEnvExample({
    envFilePath: ".env",
    outputFilePath: "dist/.env.example",
    placeholder: "INSERT_VALUE",
    preserveValues: ["API_KEY", "PUBLIC_URL"],
    includeComments: true,
    header: "# Custom Environment Example\n# Generated automatically\n",
  });
}

if (require.main === module) {
  runExample();
}

module.exports = generateEnvExample;
