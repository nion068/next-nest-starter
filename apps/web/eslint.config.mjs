import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
export default [...tseslint.configs.recommended, globalIgnores(['.next/**', 'node_modules/**', 'e2e/**', 'next-env.d.ts'])];
