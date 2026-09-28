import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import { architecture } from '../../lint/architecture';

const linter = new Linter();
const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function errors(file, code) {
  return linter.verify(
    code,
    [
      {
        plugins: { local: { rules: { architecture } } },
        rules: { 'local/architecture': 'error' },
        languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      },
    ],
    { filename: path.join(src, file) },
  );
}

describe('architecture lint rule', () => {
  it('allows imports within a feature and from shared', () => {
    expect(
      errors(
        'features/reports/pages/ReportsPage.js',
        "import '../hooks/useReportExport'; import '../../../shared/api/api';",
      ),
    ).toHaveLength(0);
  });

  it('rejects shared imports from app or features', () => {
    expect(
      errors(
        'shared/components/Example.js',
        "import '../../features/dashboard/pages/DashboardPage';",
      ),
    ).toHaveLength(1);
    expect(errors('shared/api/example.js', "export * from '../../app/routes';")).toHaveLength(1);
  });

  it('rejects imports across features and dynamic imports', () => {
    expect(
      errors(
        'features/reports/pages/Example.js',
        "import '../../../features/dashboard/hooks/useDashboardData';",
      ),
    ).toHaveLength(1);
    expect(
      errors('features/reports/pages/Example.js', "import('../../../app/routes');"),
    ).toHaveLength(1);
    expect(
      errors('shared/api/example.js', "import '../../../../Backend/app/schemas';"),
    ).toHaveLength(1);
  });
});
