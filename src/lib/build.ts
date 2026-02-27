const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process'); // For potentially running tsc for type checking

// Helper to run commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command error: ${stderr || error.message}`);
        reject(new Error(stderr || error.message));
        return;
      }
      if (stderr) {
        console.warn(`Command stderr: ${stderr}`); // Log stderr as warning
      }
      if (stdout) {
        console.log(`Command stdout: ${stdout}`);
      }
      resolve(stdout);
    });
  });
}

/**
 * 
 * @param {Object} targetConfig The config for the target platform
 * @param {String} targetName The name of the target platform ("web" or "server")
 * @param {Object} commonConfig The common configuration between both platforms
 * @returns 
 */
async function buildProject(targetConfig, targetName, commonConfig = {}) {
  if (!targetConfig || !targetConfig.entryPoints || targetConfig.entryPoints.length === 0) {
    console.warn(`⚠️ No entry points defined for ${targetName}. Skipping.`);
    return;
  }

  const {
    entryPoints,
    outfile, // Used if bundling to a single file
    outdir,  // Used if outputting multiple files or not bundling certain ways
    target,
    format,
    bundle = true,
    minify = targetName === 'web', // Default minify for web
    sourcemap = true,
    platform,
    tsconfig: targetTsconfig, // Specific tsconfig for this target
    external = [],
    copyAssets = [], // Array of {from: string, to: string}
    ...otherEsbuildOptions // Allow passing other esbuild options
  } = targetConfig;

  const projectTsconfigPath = commonConfig.tsconfig || 'tsconfig.json';
  const tsconfigToUse = targetTsconfig || projectTsconfigPath;
  const resolvedTsconfigPath = path.resolve(process.cwd(), tsconfigToUse);

  const buildOptions = {
    entryPoints: entryPoints.map(ep => path.resolve(process.cwd(), ep)),
    target,
    format,
    bundle,
    minify,
    sourcemap,
    platform,
    external,
    logLevel: 'info', // esbuild log level
    tsconfig: (await fs.pathExists(resolvedTsconfigPath)) ? resolvedTsconfigPath : undefined,
    ...otherEsbuildOptions,
  };

  if (outfile && !outdir) {
    buildOptions.outfile = path.resolve(process.cwd(), outfile);
    // Ensure output directory exists for outfile
    await fs.ensureDir(path.dirname(buildOptions.outfile));
  } else if (outdir) {
    buildOptions.outdir = path.resolve(process.cwd(), outdir);
    await fs.ensureDir(buildOptions.outdir);
  } else {
    throw new Error(`Either 'outfile' or 'outdir' must be specified in the config for ${targetName}.`);
  }

  // Type checking (esbuild doesn't do this by default)
  // This is a separate step, often desired.
  console.log(`🔍 Performing type checking for ${targetName} using ${tsconfigToUse}...`);
  try {
    // `npx tsc --noEmit --project tsconfigPath`
    // The --project flag is optional if tsc can find it automatically.
    // It's good practice to specify it if you have multiple or non-standard names/locations.
    let tscCommand = `npx tsc --noEmit`;
    if (await fs.pathExists(resolvedTsconfigPath)) {
        tscCommand += ` --project ${resolvedTsconfigPath}`;
    } else if (targetTsconfig) { // if a specific tsconfig was mentioned but not found
        console.warn(`⚠️ Specified tsconfig '${targetTsconfig}' for ${targetName} not found. Type checking might use a default tsconfig or fail if none is found.`);
    } else {
        console.info(`💡 No specific tsconfig found for ${targetName} at '${resolvedTsconfigPath}'. Type checking will proceed with tsc's default behavior.`);
    }
    await runCommand(tscCommand);
    console.log(`✅ Type checking passed for ${targetName}.`);
  } catch (error) {
    console.error(`❌ Type checking failed for ${targetName}. Build will continue, but please check errors.`);
    // Decide if you want to stop the build on type errors:
    // throw new Error(`Type checking failed for ${targetName}.`);
  }


  console.log(`📦 Building ${targetName} with esbuild... Options:`, buildOptions);
  try {
    const result = await esbuild.build(buildOptions);
    if (result.errors.length > 0) {
      console.error(`❌ esbuild errors for ${targetName}:`, result.errors);
      throw new Error(`esbuild failed for ${targetName}`);
    }
    if (result.warnings.length > 0) {
      console.warn(`⚠️ esbuild warnings for ${targetName}:`, result.warnings);
    }
  } catch (error) {
      // esbuild.build itself might throw an error for critical issues not caught in result.errors
      console.error(`❌ Critical esbuild error for ${targetName}: ${error.message}`);
      throw error; // Re-throw to stop the build
  }


  // Copy assets
  if (copyAssets && copyAssets.length > 0) {
    console.log(`📂 Copying assets for ${targetName}...`);
    for (const asset of copyAssets) {
      const sourcePath = path.resolve(process.cwd(), asset.from);
      const destPath = path.resolve(process.cwd(), asset.to);
      if (await fs.pathExists(sourcePath)) {
        try {
          await fs.ensureDir(path.dirname(destPath)); // Ensure destination directory exists
          await fs.copy(sourcePath, destPath);
          console.log(`  Copied: ${asset.from} -> ${asset.to}`);
        } catch (copyError) {
          console.error(`❌ Error copying asset ${asset.from} to ${asset.to}: ${copyError.message}`);
        }
      } else {
        console.warn(`⚠️ Asset source path not found: ${asset.from}. Skipping.`);
      }
    }
  }
}

module.exports = {
  buildProject,
};