/* Run with: node run-safeplate.js */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendFolder = path.join(__dirname, 'backend');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Install backend packages only on the first run.
if (!fs.existsSync(path.join(backendFolder, 'node_modules'))) {
  console.log('Installing backend packages...');

  const install = spawnSync(npmCommand, ['ci'], {
    cwd: backendFolder,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (install.status !== 0) {
    console.log('Package installation failed.');
    process.exit(1);
  }
}

console.log('\nStarting SafePlate...');
console.log('Open http://localhost:5000 in your browser.\n');

const server = spawn(process.execPath, ['server.js'], {
  cwd: backendFolder,
  stdio: 'inherit'
});

function stopServer() {
  server.kill();
  process.exit();
}

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);

server.on('exit', (code) => {
  process.exit(code || 0);
});