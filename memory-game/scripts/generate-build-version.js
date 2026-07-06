#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const versionFile = path.join(rootDir, 'src/constants/buildVersion.ts');
const stampFile = path.join(rootDir, '.build-version');

function gitShortSha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

const now = new Date();
const timestamp = now.toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '');
const BUILD_VERSION = `${timestamp}-${gitShortSha()}`;

const tsContent = `// Auto-generated before each web build — do not edit manually
export const BUILD_VERSION = '${BUILD_VERSION}';
export const BUILD_URL_SUFFIX = '?v=${BUILD_VERSION}';
`;

fs.writeFileSync(versionFile, tsContent);
fs.writeFileSync(stampFile, BUILD_VERSION);

console.log(`Build version: ${BUILD_VERSION}`);
