const fs = require('fs-extra');
const path = require('path');

const defaultConfigTemplatePath = path.join(
  __dirname,
  '..',
  'templates',
  'nglBuild.config.default.js'
);

async function generateDefaultConfig(targetPath) {
  if (await fs.pathExists(targetPath)) {
    // Potentially ask for confirmation before overwriting
    console.warn(
      `⚠️ Configuration file already exists at ${targetPath}. Overwriting.`
    );
  }
  await fs.copy(defaultConfigTemplatePath, targetPath);
}

async function loadConfig(configPath) {
  if (!(await fs.pathExists(configPath))) {
    return null;
  }
  try {
    // Using require allows for JS files with comments and logic
    const config = require(configPath); // require automatically handles .js
    return config;
  } catch (error) {
    console.error(`❌ Error loading configuration from ${configPath}:`);
    console.error(error);
    throw new Error(`Could not load or parse ${configPath}`);
  }
}

module.exports = {
  generateDefaultConfig,
  loadConfig,
};