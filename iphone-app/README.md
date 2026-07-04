# Nieuwe App — React Native (iPhone)

Een nieuwe native iPhone-app gebouwd met **Expo** en **React Native**, dezelfde technologie als het Memory-spel.

Dit project is een startpunt. De app-specificaties volgen nog.

## Technologie

| Onderdeel | Keuze |
|-----------|-------|
| Framework | Expo ~57 |
| UI | React Native 0.86 + TypeScript |
| iOS-build | EAS Build |
| Safe areas | react-native-safe-area-context |

## Ontwikkelen

```bash
cd iphone-app
npm install
npm start
```

Scan de QR-code met **Expo Go** op je iPhone, of druk `i` voor de iOS-simulator (Mac vereist).

## Native iOS-build (TestFlight / App Store)

```bash
npm run build:ios              # interne preview-build
npm run build:ios:production   # productie-build
```

Vereist een [Expo-account](https://expo.dev) en Apple Developer-lidmaatschap.

## Structuur

```
iphone-app/
├── App.tsx              — hoofdscherm
├── app.json             — Expo-configuratie
├── eas.json             — EAS Build-profielen
├── assets/              — iconen en afbeeldingen
└── src/
    ├── components/      — UI-componenten (nog toe te voegen)
    ├── constants/       — app-constanten
    └── hooks/           — custom hooks (nog toe te voegen)
```

## Volgende stappen

Wacht op de specificaties en vul daarna `src/components/` en `src/hooks/` aan met de app-logica.
