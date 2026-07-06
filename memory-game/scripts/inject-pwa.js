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
  fs.copyFileSync(manifestSource, path.join(outputDir, 'manifest.webmanifest'));
}

let html = fs.readFileSync(indexPath, 'utf8');
const jsMatch = html.match(/(\/_expo\/static\/js\/web\/index-[a-f0-9]+\.js)/);

if (!jsMatch) {
  console.error('Could not find web bundle in index.html');
  process.exit(1);
}

const jsPath = `${BASE_PATH}${jsMatch[1]}`;
fs.writeFileSync(
  path.join(outputDir, 'entry.json'),
  JSON.stringify({ version: BUILD_VERSION, js: jsPath }),
);

const headScript = `
    <script>
      (function () {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function (regs) {
            regs.forEach(function (reg) { reg.unregister(); });
          });
        }
      })();
    </script>
`;

const loaderScript = `
    <script>
      (function () {
        var base = '${BASE_PATH}';
        var root = document.getElementById('root');

        function showMessage(html) {
          if (root) {
            root.innerHTML = '<p class="boot-message">' + html + '</p>';
          }
        }

        function loadBundle(entry) {
          var script = document.createElement('script');
          script.src = entry.js + '?v=' + encodeURIComponent(entry.version) + '&_=' + Date.now();
          script.defer = true;
          script.onerror = function () {
            var retryUrl = base + '/?v=' + encodeURIComponent(entry.version) + '&_=' + Date.now();
            showMessage(
              'App laden mislukt.<br/><br/>' +
              '<a href="' + retryUrl + '" style="color:#ffffff;font-weight:700">Opnieuw proberen</a>'
            );
          };
          document.body.appendChild(script);
        }

        fetch(base + '/entry.json?_=' + Date.now(), { cache: 'no-store' })
          .then(function (response) {
            if (!response.ok) {
              throw new Error('entry');
            }
            return response.json();
          })
          .then(loadBundle)
          .catch(function () {
            showMessage(
              'Kan de nieuwste versie niet laden.<br/><br/>' +
              '<a href="' + base + '/" style="color:#ffffff;font-weight:700">Open Memory opnieuw</a>'
            );
          });
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
        height: 100%;
        overflow: auto !important;
        -webkit-overflow-scrolling: touch;
      }
      #root {
        min-height: 100vh;
        min-height: -webkit-fill-available;
        height: 100%;
        background-color: #4d5fd6;
        display: flex !important;
        flex-direction: column;
        flex: 1;
      }
      .boot-message {
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        text-align: center;
        padding: 48px 24px;
        font-size: 18px;
        line-height: 1.5;
      }
      .boot-message a {
        color: #ffffff;
      }
    </style>
`;

const bootMessage =
  `<p class="boot-message">Memory laden…<br/><small>versie ${BUILD_VERSION}</small></p>`;

html = html.replace(/<link rel="icon" href="[^"]*"\/>/, `<link rel="icon" href="${withCacheBust(`${BASE_PATH}/favicon.ico`)}" />`);
html = html.replace('<head>', `<head>${headScript}`);
html = html.replace('</head>', `${pwaTags}  </head>`);
html = html.replace('<div id="root"></div>', `<div id="root">${bootMessage}</div>`);
html = html.replace(/\s*<script src="[^"]*index-[a-f0-9]+\.js[^"]*" defer><\/script>/, loaderScript);

fs.writeFileSync(indexPath, html);
console.log(`PWA injected (${BUILD_VERSION})`);
