import tseslint from 'typescript-eslint';
export default [
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      curly: ['error', 'all'],
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: false }],
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
