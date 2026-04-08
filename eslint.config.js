export default {
  extends: ['alloy', 'alloy/typescript', 'prettier'],
  env: {
    browser: true,
    node: true,
  },
  globals: {},
  rules: {
    'no-new': 'off',
    'no-undef': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-require-imports': 'off',
  },
  plugins: ['prettier'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'prettier/prettier': 'error',
      },
    },
  ],
};
