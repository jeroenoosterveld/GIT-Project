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
    <link rel="manifest" href="/GIT-Project/manifest.webmanifest" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Memory" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#5b6cff" />
    <link rel="apple-touch-icon" href="/GIT-Project/assets/icon.png" />
`;

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace('</head>', `${pwaTags}  </head>`);
html = html.replace(
  '</body>',
  `    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/GIT-Project/service-worker.js');
        });
      }
    </script>
  </body>`,
);

fs.writeFileSync(indexPath, html);
console.log(`PWA tags injected into ${indexPath}`);
