# Foto Puzzel

Een offline schuifpuzzel-app voor iPhone Safari. Kies een foto uit je bibliotheek, bepaal het aantal stukjes, en los de puzzel op door te schuiven.

## Live app (permanent)

**https://jeroenoosterveld.github.io/Memory-game/puzzel/**

De app wordt automatisch gepubliceerd via GitHub Pages bij elke wijziging op `master`.

## Functies

- Foto kiezen uit je fotobibliotheek
- Puzzelgrootte: 3×3, 4×4, 5×5 of 6×6
- Klassieke schuifpuzzel: tik op een stukje naast het lege vak
- Zetten-teller en timer
- Werkt volledig offline (PWA)
- Installeerbaar op je iPhone-homescreen

## Gebruik op iPhone

1. Open de app in Safari
2. Tik op **Delen** (vierkant met pijl)
3. Kies **"Zet op beginscherm"**
4. De app opent daarna als standalone app, ook zonder internet

## Lokaal draaien

```bash
# Start een lokale server (vereist voor service worker)
python3 -m http.server 8080
```

Open vervolgens `http://localhost:8080` in je browser. Voor testen op je iPhone: gebruik het IP-adres van je computer op hetzelfde wifi-netwerk.

## Bestanden

| Bestand | Beschrijving |
|---------|-------------|
| `index.html` | Hoofdpagina |
| `styles.css` | Styling (iPhone-geoptimaliseerd) |
| `app.js` | Puzzellogica |
| `manifest.json` | PWA-manifest |
| `service-worker.js` | Offline caching |
