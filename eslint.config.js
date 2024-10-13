import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  // env.
  ...compat.env({
    browser: true,
    es2021: true,
    node: true,
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
  }),
  {
    // target files.
    files: ['src/**/*.js'],
    // ignore files.
    ignores: ['**/*.config.js'],
    // rules.
    rules: {
      'max-len': 'off',
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      'import/prefer-default-export': ['off'],
    },
  },
];
