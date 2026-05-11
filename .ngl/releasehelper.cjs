const axios = require('axios');
const pkg = require('../package.json');
const { exec } = require('child_process');
const token = process.env.API_TOKEN

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
      resolve(stdout);
    });
  });
}

async function createRelease() {
    const lastTag = await runCommand('git describe --tags --abbrev=0 2>/dev/null')
    const changelog = await runCommand(`git log ${lastTag.trim()}..HEAD --pretty=format:"- %s"`)

    axios.post('https://code.internal.aball.dev/api/v1/repos/aball-dev/ngl-Build/releases', {
        'name': `v${pkg.version}`,
        'tag_name': `v${pkg.version}`,
        'body': `# Changelog <br>${changelog}`
    }, {
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
        }
    })

}

createRelease()