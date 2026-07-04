#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
    <meta name="theme-color" content="#5b6cff" />
    <link rel="apple-touch-icon" href="/Memory-game/assets/icon.png" />
`;

const cacheCleanupScript = `
    <script>
      (function () {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function (regs) {
            regs.forEach(function (reg) { reg.unregister(); });
          });
          navigator.serviceWorker.register('/Memory-game/service-worker.js').catch(function () {});
        }
        if (window.caches) {
          caches.keys().then(function (keys) {
            keys.forEach(function (key) { caches.delete(key); });
          });
        }
      })();
    </script>
`;

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace('</head>', `${pwaTags}  </head>`);
html = html.replace('</body>', `${cacheCleanupScript}  </body>`);

fs.writeFileSync(indexPath, html);
console.log(`PWA tags injected into ${indexPath}`);
