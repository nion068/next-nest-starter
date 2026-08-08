#!/usr/bin/env node

import { access, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const templateName = 'next-nest-starter';
const templateScope = '@starter';
const templateServiceName = 'starter-api';

const files = [
  '.env.example',
  '.github/workflows/ci.yml',
  'README.md',
  'apps/api/Dockerfile',
  'apps/api/package.json',
  'apps/api/src/telemetry.ts',
  'apps/web/Dockerfile',
  'apps/web/next.config.ts',
  'apps/web/package.json',
  'apps/web/src/components/login-form.tsx',
  'observability/signoz/casting.yaml',
  'package.json',
  'packages/api-client/package.json',
  'pnpm-lock.yaml',
];

function parseProjectName(value) {
  const name = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(name)) {
    throw new Error(
      'Use lowercase letters, numbers, and single hyphens (for example: abashx or acme-portal).',
    );
  }
  if (name === templateName) {
    throw new Error(`Choose a name other than ${templateName}.`);
  }
  return name;
}

async function projectNameFromPrompt() {
  const argument = process.argv[2];
  if (argument) return parseProjectName(argument);
  if (!input.isTTY) {
    throw new Error('Pass a project name when running non-interactively: pnpm init:project abashx');
  }

  const readline = createInterface({ input, output });
  try {
    return parseProjectName(await readline.question('Project name: '));
  } finally {
    readline.close();
  }
}

async function main() {
  const rootPackage = JSON.parse(await readFile('package.json', 'utf8'));
  if (rootPackage.name !== templateName) {
    throw new Error(`This initializer can only run on an uninitialized ${templateName} copy.`);
  }

  const name = await projectNameFromPrompt();
  const replacements = [
    [templateName, name],
    [templateScope, `@${name}`],
    [templateServiceName, `${name}-api`],
  ];

  const updates = await Promise.all(
    files.map(async (file) => {
      await access(file, constants.R_OK);
      const original = await readFile(file, 'utf8');
      const updated = replacements.reduce(
        (text, [from, to]) => text.replaceAll(from, to),
        original,
      );
      return { file, original, updated };
    }),
  );

  const untouched = updates.filter(({ original, updated }) => original === updated);
  if (untouched.length > 0) {
    throw new Error(
      `Expected template identifiers in: ${untouched.map(({ file }) => file).join(', ')}`,
    );
  }

  await Promise.all(updates.map(({ file, updated }) => writeFile(file, updated)));
  console.log(`Initialized ${name}. Next, run pnpm install and copy .env.example to .env.`);
}

main().catch((error) => {
  console.error(`Initialization failed: ${error.message}`);
  process.exitCode = 1;
});
