import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const criticalThreshold = { statements: 90, branches: 85, functions: 90, lines: 90 };
const criticalFiles = [
  'src/shared/api/api.js',
  'src/shared/api/validators.js',
  'src/shared/api/errorMessage.js',
  'src/shared/lib/activityStatus.js',
  'src/shared/lib/requestFailure.js',
  'src/shared/lib/routeLeaveGuard.js',
  'src/features/dashboard/hooks/useDashboardData.js',
  'src/features/dashboard/hooks/useAutoRefresh.js',
  'src/features/reports/hooks/useReportExport.js',
];

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: ['./src/testing/setup.js'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/testing/**', 'src/shared/api/contracts.js'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
        'src/shared/api/**': criticalThreshold,
        'src/shared/lib/**': criticalThreshold,
        'src/features/dashboard/hooks/**': criticalThreshold,
        'src/features/reports/hooks/**': criticalThreshold,
        ...Object.fromEntries(criticalFiles.map((file) => [file, criticalThreshold])),
      },
    },
  },
});
