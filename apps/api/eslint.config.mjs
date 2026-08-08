import tseslint from 'typescript-eslint';
export default [...tseslint.configs.recommended, { files: ['src/**/*.ts'], rules: { 'no-undef': 'off', '@typescript-eslint/no-explicit-any': 'off' } }];
