import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
export default [
  ...tseslint.configs.recommended,
  {
    rules: {
      curly: ['error', 'all'],
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: false }],
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'e2e/**', 'next-env.d.ts']),
];
