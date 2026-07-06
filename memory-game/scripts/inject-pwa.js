#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputDir = process.argv[2] || path.join(rootDir, 'dist-web');
const indexPath = path.join(outputDir, 'index.html');
const stampFile = path.join(rootDir, '.build-version');
const iconSource = path.join(rootDir, 'assets/icon.png');
const iconTargetDir = path.join(outputDir, 'assets');
const iconTarget = path.join(iconTargetDir, 'icon.png');
const manifestSource = path.join(rootDir, 'public/manifest.webmanifest');
const BASE_PATH = '/Memory-game';

if (!fs.existsSync(indexPath)) {
  console.error(`Missing ${indexPath}. Run expo export first.`);
  process.exit(1);
}

const BUILD_VERSION = fs.readFileSync(stampFile, 'utf8').trim();
const cacheQuery = `?v=${BUILD_VERSION}`;

function withCacheBust(assetPath) {
  return `${assetPath}${cacheQuery}`;
}

fs.mkdirSync(iconTargetDir, { recursive: true });
fs.copyFileSync(iconSource, iconTarget);
fs.writeFileSync(path.join(outputDir, 'version.txt'), BUILD_VERSION);

if (fs.existsSync(manifestSource)) {
  let manifest = fs.readFileSync(manifestSource, 'utf8');
  manifest = manifest.replace(
    `"start_url": "${BASE_PATH}/"`,
    `"start_url": "${BASE_PATH}/${cacheQuery}"`,
  );
  fs.writeFileSync(path.join(outputDir, 'manifest.webmanifest'), manifest);
}

const cacheBustScript = `
    <script>
      (function () {
        var BUILD_VERSION = '${BUILD_VERSION}';
        var BASE_PATH = '${BASE_PATH}';
        var url = new URL(window.location.href);

        function clearCaches() {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (regs) {
              regs.forEach(function (reg) { reg.unregister(); });
            });
          }
          if (window.caches) {
            caches.keys().then(function (keys) {
              keys.forEach(function (key) { caches.delete(key); });
            });
          }
        }

        if (url.searchParams.get('v') !== BUILD_VERSION) {
          clearCaches();
          url.searchParams.set('v', BUILD_VERSION);
          window.location.replace(url.toString());
          return;
        }

        var storedVersion = localStorage.getItem('memory-game-version');
        if (storedVersion && storedVersion !== BUILD_VERSION) {
          clearCaches();
          localStorage.setItem('memory-game-version', BUILD_VERSION);
          url.searchParams.set('v', BUILD_VERSION);
          window.location.replace(url.toString());
          return;
        }

        localStorage.setItem('memory-game-version', BUILD_VERSION);
        clearCaches();

        fetch(BASE_PATH + '/version.txt?_=' + Date.now(), { cache: 'no-store' })
          .then(function (response) { return response.text(); })
          .then(function (latest) {
            var remoteVersion = latest.trim();
            if (remoteVersion && remoteVersion !== BUILD_VERSION) {
              localStorage.setItem('memory-game-version', remoteVersion);
              var nextUrl = new URL(window.location.href);
              nextUrl.searchParams.set('v', remoteVersion);
              window.location.replace(nextUrl.toString());
            }
          })
          .catch(function () {});
      })();
    </script>
`;

const pwaTags = `
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta name="build-version" content="${BUILD_VERSION}" />
    <link rel="manifest" href="${withCacheBust(`${BASE_PATH}/manifest.webmanifest`)}" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Memory" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#4d5fd6" />
    <link rel="apple-touch-icon" href="${withCacheBust(`${BASE_PATH}/assets/icon.png`)}" />
    <style>
      html, body {
        margin: 0;
        background-color: #4d5fd6 !important;
        min-height: 100%;
        min-height: -webkit-fill-available;
      }
      #root {
        min-height: 100vh;
        min-height: -webkit-fill-available;
        background-color: #4d5fd6;
      }
      .boot-message {
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        text-align: center;
        padding: 48px 24px;
        font-size: 18px;
      }
    </style>
`;

const bootMessage =
  `<p class="boot-message">Memory laden…<br/><small>versie ${BUILD_VERSION}</small></p>`;

let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(/<link rel="icon" href="[^"]*"\/>/, `<link rel="icon" href="${withCacheBust(`${BASE_PATH}/favicon.ico`)}" />`);
html = html.replace(
  /(\/_expo\/static\/js\/web\/index-[a-f0-9]+\.js)(\?v=[^"]*)?"/,
  `$1?v=${BUILD_VERSION}"`,
);
html = html.replace('<head>', `<head>${cacheBustScript}`);
html = html.replace('</head>', `${pwaTags}  </head>`);
html = html.replace('<div id="root"></div>', `<div id="root">${bootMessage}</div>`);

fs.writeFileSync(indexPath, html);
console.log(`Cache busting injected (${BUILD_VERSION})`);
