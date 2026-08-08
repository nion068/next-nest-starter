import tseslint from 'typescript-eslint';
export default [
  ...tseslint.configs.recommended,
  {
    rules: {
      curly: ['error', 'all'],
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: false }],
    },
  },
];
