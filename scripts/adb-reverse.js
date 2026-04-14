const { execFileSync } = require('child_process');

const run = (cmd, args) => {
  try {
    execFileSync(cmd, args, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
};

const listDevices = () => {
  try {
    const out = execFileSync('adb', ['devices'], { encoding: 'utf8' });
    return out
      .split('\n')
      .slice(1)
      .map((line) => line.trim().split('\t'))
      .filter(([id, state]) => id && state === 'device')
      .map(([id]) => id);
  } catch {
    return [];
  }
};

const devices = listDevices();
if (devices.length === 0) {
  process.exit(0);
}

for (const id of devices) {
  run('adb', ['-s', id, 'reverse', 'tcp:8081', 'tcp:8081']);
}
