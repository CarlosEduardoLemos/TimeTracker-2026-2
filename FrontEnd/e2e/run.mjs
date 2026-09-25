import { spawn, spawnSync } from 'node:child_process';

const vite = 'node_modules/vite/bin/vite.js';
if (!process.env.RUN_REAL_API) process.env.VITE_API_URL = 'http://localhost:8000';
const build = spawnSync(process.execPath, [vite, 'build', '--configLoader', 'runner'], {
  stdio: 'inherit',
});
if (build.status !== 0) process.exit(build.status || 1);

const server = spawn(
  process.execPath,
  [
    vite,
    'preview',
    '--configLoader',
    'runner',
    '--host',
    '127.0.0.1',
    '--port',
    '5173',
    '--strictPort',
  ],
  { stdio: 'ignore' },
);

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error('Servidor de preview encerrou antes dos testes.');
    try {
      const response = await fetch('http://127.0.0.1:5173/');
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // Wait until the preview server accepts connections.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Servidor de preview não iniciou em 30 segundos.');
  const run = spawnSync(
    process.execPath,
    ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)],
    {
      stdio: 'inherit',
    },
  );
  process.exitCode = run.status || (run.error ? 1 : 0);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  server.kill();
  server.unref();
}
