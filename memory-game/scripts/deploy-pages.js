#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist-web');
const defaultRepo = 'jeroenoosterveld/Memory-game';
const repoSlug = process.env.GITHUB_REPOSITORY || defaultRepo;
const repoUrl = process.env.GITHUB_TOKEN
  ? `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${repoSlug}.git`
  : `https://github.com/${repoSlug}.git`;

function run(command, options = {}) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit', cwd: rootDir, ...options });
}

run('node scripts/generate-build-version.js');

const buildVersion = fs.readFileSync(path.join(rootDir, '.build-version'), 'utf8').trim();
process.env.EXPO_PUBLIC_BUILD_VERSION = buildVersion;

run('npx expo export --platform web --output-dir dist-web', {
  env: { ...process.env, EXPO_PUBLIC_BUILD_VERSION: buildVersion },
});
run('node scripts/inject-pwa.js dist-web');

run('touch .nojekyll', { cwd: distDir });

const deployDir = distDir;
run('git init', { cwd: deployDir });
run('git config user.email "deploy@memory-game.local"', { cwd: deployDir });
run('git config user.name "Memory Game Deploy"', { cwd: deployDir });
run('git add -A', { cwd: deployDir });
run('git commit -m "Deploy Memory-game ' + buildVersion + '"', { cwd: deployDir });
run('git branch -M gh-pages', { cwd: deployDir });
run(`git push -f ${repoUrl} gh-pages`, { cwd: deployDir });

console.log('\nDeployed: https://jeroenoosterveld.github.io/Memory-game/?v=' + buildVersion);
