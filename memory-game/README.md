# Memory — React Native (offline)

Een memory-spelletje voor iPhone gebouwd met **Expo** en **React Native**. Alle plaatjes zitten in de app; er is **geen internet nodig** om te spelen.

## Spel

- Draai kaarten om en vind bijpassende paartjes
- Twee moeilijkheidsgraden: **Makkelijk** (6 paren) en **Normaal** (8 paren)
- Timer, zettenteller en voortgang
- Animaties bij het omdraaien van kaarten
- Werkt volledig offline

---

## Op je iPhone installeren (zonder server)

`npm start` en Expo Go zijn alleen voor **ontwikkelaars** tijdens het bouwen. Als je de app gewoon op je telefoon wilt gebruiken, maak je **één keer** een echte iOS-app en installeer je die. Daarna heb je geen computer of server meer nodig.

### Wat je nodig hebt

- Een **Apple ID** (gratis)
- Een **Apple Developer-account** ($99/jaar) — nodig om de app op een echte iPhone te installeren
- Een **Expo-account** (gratis) — [expo.dev/signup](https://expo.dev/signup)

### Stappen

```bash
cd memory-game
npm install
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform ios --profile preview
```

1. Log in bij Expo (`eas login`)
2. `build:configure` koppelt het project aan je Expo-account (eenmalig)
3. `build` bouwt de app in de cloud (duurt ~10–20 minuten)
4. Als de build klaar is, krijg je een **link** — open die op je iPhone om te installeren

De app staat daarna als icoon op je homescherm en werkt **volledig offline**, zonder server.

### Alternatief: Mac met Xcode

Heb je een Mac? Dan kun je lokaal bouwen:

```bash
cd memory-game
npm install
npx expo prebuild --platform ios
npx expo run:ios --configuration Release
```

---

## Ontwikkelen (optioneel)

Alleen nodig als je de code wilt aanpassen:

```bash
npm start
```

---

## Eigen plaatjes

Vervang de bestanden in `assets/cards/` en pas `src/constants/cards.ts` aan. Daarna opnieuw een build maken.

## Structuur

- `App.tsx` — hoofdscherm
- `src/hooks/useMemoryGame.ts` — spel-logica
- `src/components/` — UI-componenten
- `assets/cards/` — lokale kaartafbeeldingen
- `eas.json` — configuratie voor iOS-build
