import eslint from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import * as tsEslint from 'typescript-eslint';

export default tsEslint.config(
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...eslint.configs.recommended,
  },
  tsEslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs['jsx-runtime'],
  pluginReactHooks.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-refresh': pluginReactRefresh,
    },
    settings: {
      react: {
        version: '18.3',
      },
    },
    rules: {
      'no-new': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
    },
  }
);
