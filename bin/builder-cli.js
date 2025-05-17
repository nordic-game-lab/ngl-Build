#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const { generateDefaultConfig, loadConfig } = require('../lib/config');
const { buildProject } = require('../lib/build');

yargs(hideBin(process.argv))
  .command(
    'init',
    'Generate a default nglBuild.config.cjs file',
    () => {},
    async (argv) => {
      try {
        const configPath = path.resolve(process.cwd(), 'nglBuild.config.cjs');
        await generateDefaultConfig(configPath);
        console.log(`✅ Default configuration file created at ${configPath}`);
      } catch (error) {
        console.error(`❌ Error generating config file: ${error.message}`);
        process.exit(1);
      }
    }
  )
  .command(
    'build [target]',
    'Build the project for a specific target (web or server) or all if not specified',
    (yargs) => {
      return yargs.positional('target', {
        describe: 'The build target',
        type: 'string',
        choices: ['web', 'server', 'all'], // 'all' could be a special case
        default: 'all',
      });
    },
    async (argv) => {
      try {
        const configPath = path.resolve(process.cwd(), 'nglBuild.config.cjs');
        const config = await loadConfig(configPath);
        if (!config) {
          console.error(
            '❌ No nglBuild.config.js found. Run "ngl-build init" to create one.'
          );
          process.exit(1);
        }

        console.log(`🚀 Starting build for target: ${argv.target}...`);

        if (argv.target === 'all' || argv.target === 'web') {
          if (config.web) {
            console.log('Building for web...');
            await buildProject(config.web, 'web', config.common);
            console.log('✅ Web build completed.');
          } else {
            console.warn('⚠️ Web configuration not found. Skipping web build.');
          }
        }

        if (argv.target === 'all' || argv.target === 'server') {
          if (config.server) {
            console.log('Building for server...');
            await buildProject(config.server, 'server', config.common);
            console.log('✅ Server build completed.');
          } else {
            console.warn('⚠️ Server configuration not found. Skipping server build.');
          }
        }
        console.log('🎉 Build process finished.');
      } catch (error) {
        console.error(`❌ Build failed: ${error.message}`);
        console.error(error.stack); // For more detailed debugging
        process.exit(1);
      }
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('h', 'help')
  .strict()
  .parse();