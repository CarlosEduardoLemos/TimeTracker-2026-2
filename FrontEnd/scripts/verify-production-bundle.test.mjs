import assert from 'node:assert/strict';
import test from 'node:test';
import { findDevMockArtifacts } from './verify-production-bundle.mjs';

test('detecta arquivos e referências de mocks dentro do bundle', () => {
  const findings = findDevMockArtifacts(
    ['assets/client.js', 'mockServiceWorker.js'],
    [
      { file: 'assets/client.js', text: 'fetch("/dashboard/attendance")' },
      { file: 'assets/worker.js', text: 'setupWorker()' },
    ],
  );
  assert.equal(findings.length, 3);
});

test('aceita bundle sem worker, handlers ou rotas propostas', () => {
  assert.deepEqual(
    findDevMockArtifacts(
      ['index.html', 'assets/index.js'],
      [
        { file: 'index.html', text: '<div id="root"></div>' },
        { file: 'assets/index.js', text: 'React.createElement("main")' },
      ],
    ),
    [],
  );
});
