# Memory — React Native (offline)

Een memory-spelletje voor iPhone gebouwd met **Expo** en **React Native**. Alle plaatjes zitten in de app; er is **geen internet nodig** om te spelen.

## Spel

- Draai kaarten om en vind bijpassende paartjes
- Twee moeilijkheidsgraden: **Makkelijk** (6 paren) en **Normaal** (8 paren)
- Timer, zettenteller en voortgang
- Animaties bij het omdraaien van kaarten
- Werkt volledig offline

---

## Alleen iPhone, geen computer? → Zie IPHONE.md

**[IPHONE.md](./IPHONE.md)** — Stap-voor-stap: spel op je beginscherm zetten via Safari. Geen server, geen Expo Go, geen Mac nodig.

Korte versie:
1. Zet GitHub Pages aan (via Safari op github.com)
2. Open **https://jeroenoosterveld.github.io/GIT-Project/**
3. Safari → Deel → **Zet op beginscherm**

---

## Native iOS-app (wel computer nodig)

Voor een echte App Store-app of TestFlight-build heb je een Mac of EAS Build nodig. Zie eerdere instructies met `eas build`.

---

## Ontwikkelen (optioneel)

```bash
npm install
npm start
```

---

## Eigen plaatjes

Vervang de bestanden in `assets/cards/` en pas `src/constants/cards.ts` aan.

## Structuur

- `App.tsx` — hoofdscherm
- `src/hooks/useMemoryGame.ts` — spel-logica
- `src/components/` — UI-componenten
- `assets/cards/` — lokale kaartafbeeldingen
- `IPHONE.md` — instructies zonder computer
- `eas.json` — configuratie voor native iOS-build

