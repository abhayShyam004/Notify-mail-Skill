const fs = require('fs');
const path = require('path');
const os = require('os');

function testConfigExists() {
  const configPath = path.join(os.homedir(), '.notify-email', 'config.json');
  if (fs.existsSync(configPath)) {
    console.log('✅ PASS: Global config exists at ' + configPath);
  } else {
    console.error('❌ FAIL: Global config does not exist at ' + configPath);
    console.log('Follow README.md instructions to create one.');
  }
}

testConfigExists();
