const axios = require('axios');
const pkg = require('../package.json');
const token = process.env.API_TOKEN

async function createRelease() {
    axios.post('https://code.internal.aball.dev/api/v1/repos/aball-dev/ngl-Build/releases', {
        'name': `v${pkg.version}`,
        'tag_name': `v${pkg.version}`,
    }, {
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
        }
    })

}

const labels = process.env.CI_COMMIT_PULL_REQUEST_LABELS;
if (labels.includes('auto-release')){
    createRelease()
}