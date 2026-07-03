# Memory — React Native (offline)

Een memory-spelletje voor iPhone (en Android) gebouwd met **Expo** en **React Native**. Alle plaatjes zitten in de app; er is geen internet nodig om te spelen.

## Spel

- Draai kaarten om en vind bijpassende paartjes
- Twee moeilijkheidsgraden: **Makkelijk** (6 paren) en **Normaal** (8 paren)
- Timer, zettenteller en voortgang
- Animaties bij het omdraaien van kaarten
- Werkt volledig offline

## Lokaal starten

```bash
cd memory-game
npm install
npm start
```

Scan de QR-code met de **Expo Go**-app op je iPhone, of druk op `i` in de terminal (vereist macOS + Xcode voor de simulator).

## iPhone-build (zonder Expo Go)

Op een Mac met Xcode:

```bash
cd memory-game
npx expo prebuild --platform ios
npx expo run:ios
```

Voor publicatie in de App Store kun je [EAS Build](https://docs.expo.dev/build/introduction/) gebruiken.

## Eigen plaatjes

Vervang de bestanden in `assets/cards/` en pas `src/constants/cards.ts` aan.

## Structuur

- `App.tsx` — hoofdscherm
- `src/hooks/useMemoryGame.ts` — spel-logica
- `src/components/` — UI-componenten
- `assets/cards/` — lokale kaartafbeeldingen
