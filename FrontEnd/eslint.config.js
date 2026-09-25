import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    ...react.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      // Props are plain JavaScript and currently have no runtime PropTypes layer.
      'react/prop-types': 'off',
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    ...jsxA11y.flatConfigs.recommended,
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // Scrollable table wrappers need a keyboard focus target.
      'jsx-a11y/no-noninteractive-tabindex': 'off',
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    ...reactHooks.configs.flat.recommended,
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      // Initial data loading intentionally starts in useEffect.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
