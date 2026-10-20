// Test-only CMS. It never contacts a provider or ships fixtures as an application fallback.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
const mode = process.argv[2] ?? 'success';
if (!['success', 'empty', 'malformed', 'unavailable', 'rendering'].includes(mode)) throw Error('Unknown fixture mode');
const fixture = JSON.parse(readFileSync(new URL('./fixtures/recipes.json', import.meta.url), 'utf8'));
if (mode === 'rendering') fixture.data.push(...JSON.parse(readFileSync(new URL('./fixtures/rendering.json', import.meta.url), 'utf8')).data);
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (!req.url.startsWith('/items/')) { res.writeHead(404); res.end('{}'); return; }
  if (mode === 'unavailable') { res.writeHead(503); res.end('{}'); return; }
  res.end(JSON.stringify({ data: mode === 'malformed' ? {} : mode === 'empty' || !req.url.startsWith('/items/recipes') ? [] : fixture.data }));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const child = spawn('npm', ['run', 'build'], {
    stdio: 'inherit', env: { ...process.env, PUBLIC_DIRECTUS_URL: `http://127.0.0.1:${server.address().port}`, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  process.exitCode = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', code => resolve(code ?? 1)); });
} finally { server.close(); }
