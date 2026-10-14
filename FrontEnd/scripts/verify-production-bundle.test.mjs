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

test('detecta componentes de interface exclusivos dos mocks', () => {
  assert.deepEqual(
    findDevMockArtifacts(
      ['assets/tasks.js'],
      [{ file: 'assets/tasks.js', text: '<section data-mock-only="true">' }],
    ),
    ['assets/tasks.js: data-mock-only="true"'],
  );
});

test('detecta o bloqueio local de rotas sem mock', () => {
  assert.deepEqual(
    findDevMockArtifacts([], [{ file: 'assets/api.js', text: 'chamada real bloqueada' }]),
    ['assets/api.js: chamada real bloqueada'],
  );
});
