#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BUILD_VERSION = '2026-07-04-fotos';
const outputDir = process.argv[2] || 'dist-web';
const indexPath = path.join(outputDir, 'index.html');
const iconSource = path.join('assets', 'icon.png');
const iconTargetDir = path.join(outputDir, 'assets');
const iconTarget = path.join(iconTargetDir, 'icon.png');

if (!fs.existsSync(indexPath)) {
  console.error(`Missing ${indexPath}. Run expo export first.`);
  process.exit(1);
}

fs.mkdirSync(iconTargetDir, { recursive: true });
fs.copyFileSync(iconSource, iconTarget);

const pwaTags = `
    <link rel="manifest" href="/Memory-game/manifest.webmanifest" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Memory" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#4d5fd6" />
    <link rel="apple-touch-icon" href="/Memory-game/assets/icon.png" />
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

const cleanupScript = `
    <script>
      (function () {
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
      })();
    </script>
`;

const bootMessage =
  `<p class="boot-message">Memory laden…<br/><small>versie ${BUILD_VERSION}</small></p>`;

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace('</head>', `${pwaTags}  </head>`);
html = html.replace('<div id="root"></div>', `<div id="root">${bootMessage}</div>`);
html = html.replace(/(\/_expo\/static\/js\/web\/index-[a-f0-9]+\.js)"/, `$1?v=${BUILD_VERSION}"`);
html = html.replace('</body>', `${cleanupScript}  </body>`);

fs.writeFileSync(indexPath, html);
console.log(`PWA tags injected into ${indexPath}`);
