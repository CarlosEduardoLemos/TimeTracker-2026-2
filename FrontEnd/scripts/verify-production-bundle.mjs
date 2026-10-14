import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const blockedText = [
  'src/dev-mocks',
  'mockServiceWorker.js',
  'msw/browser',
  'setupWorker',
  '/dashboard/attendance',
  '/dashboard/task-hours',
  '/agents/status',
  'chamada real bloqueada',
  'data-mock-only="true"',
];

export function findDevMockArtifacts(paths, contents) {
  const pathFindings = paths
    .filter((file) => /(?:^|[\\/])(?:dev-mocks|mockServiceWorker\.js)(?:[\\/]|$)/i.test(file))
    .map((file) => `arquivo: ${file}`);
  const textFindings = contents.flatMap(({ file, text }) =>
    blockedText.filter((pattern) => text.includes(pattern)).map((pattern) => `${file}: ${pattern}`),
  );
  return [...pathFindings, ...textFindings];
}

async function readBundle(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  const contents = [];
  for (const entry of entries) {
    const filename = path.join(current, entry.name);
    if (entry.isDirectory()) {
      const child = await readBundle(root, filename);
      files.push(...child.files);
      contents.push(...child.contents);
      continue;
    }
    const relative = path.relative(root, filename).replaceAll(path.sep, '/');
    files.push(relative);
    contents.push({ file: relative, text: await readFile(filename, 'utf8') });
  }
  return { files, contents };
}

export async function verifyProductionBundle(root = path.resolve('dist')) {
  const { files, contents } = await readBundle(root);
  const findings = findDevMockArtifacts(files, contents);
  if (findings.length) {
    throw new Error(`Mocks de desenvolvimento encontrados em dist/:\n${findings.join('\n')}`);
  }
  console.log('dist/ inspecionado: handlers, worker e rotas de mocks não foram incluídos.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await verifyProductionBundle();
}
