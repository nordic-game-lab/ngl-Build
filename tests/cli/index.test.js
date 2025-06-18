const { exec } = require('child_process');

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

async function main(){
    console.log("Starting Test")
    try{
    await runCommand('npx ngl-build build');
    } catch(e){
        throw new Error("Building faild... Test failed... Output: " + e);
    }
    console.log('Testing built file');
    try{
    runCommand('npm run test');
    } catch(e){
        throw new Error("Test failed... Output: " + e);
    }
}

main()