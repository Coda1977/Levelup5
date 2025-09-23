/**
 * ESLint Config for LevelUp5 (CommonJS)
 * - Uses @typescript-eslint v7 parser/plugin (matches package.json)
 * - Uses Next core-web-vitals and React Hooks rules
 * - Prettier handles formatting (no conflicting rules here)
 */

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const next = require('@next/eslint-plugin-next');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    name: 'ignores',
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'out/**',
      'build/**',
      'coverage/**'
    ]
  },
  {
    name: 'base',
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      '@next/next': next
    },
    rules: {
      // Next.js Core Web Vitals
      ...next.configs['core-web-vitals'].rules,

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }]
    }
  }
];