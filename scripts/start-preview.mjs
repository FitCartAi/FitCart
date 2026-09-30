// Runs inside Codespaces, never on the visitor's computer.
import { spawn } from 'node:child_process';
import { existsSync, openSync, closeSync } from 'node:fs';
const url = 'http://127.0.0.1:3000';
if (!existsSync('node_modules/next/package.json')) {
  console.error('FitCart dependencies are missing. Open the Codespaces creation log and share its installation error with the team.');
  process.exit(1);
}
let running = false;
try { running = (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok; } catch { /* Start it below. */ }
if (!running) {
  const log = openSync('/tmp/fitcart-preview.log', 'a');
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '0.0.0.0', '--port', '3000'], { detached: true, stdio: ['ignore', log, log], env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
  child.on('error', error => { console.error('Could not start preview:', error.message); process.exitCode = 1; });
  child.unref(); closeSync(log);
}
console.log('FitCart preview is starting at http://localhost:3000. Open port 3000 using the Ports tab. Startup log: /tmp/fitcart-preview.log');
