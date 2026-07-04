# Deployment (iPhone / GitHub Pages)

Na **elke wijziging** die gebruikers op iPhone moeten zien:

```bash
cd memory-game
npm run deploy:pages
```

Dit gebeurt **automatisch** bij elke push naar `master` of `cursor/**` via GitHub Actions.

## Wat deploy:pages altijd doet

1. **Nieuwe versiestempel** — datum + git-commit (`2026-07-04-0655-abc1234`)
2. **Cache-busting** — JavaScript krijgt `?v=...` zodat iPhones geen oude versie laden
3. **Versielabel in app** — onderaan het scherm zichtbaar
4. **Service workers wissen** — voorkomt wit scherm door oude cache
5. **Push naar `gh-pages`** — live op https://jeroenoosterveld.github.io/Memory-game/

## Live URL (met cache-bust)

```
https://jeroenoosterveld.github.io/Memory-game/?v=<BUILD_VERSION>
```

Het versienummer staat onderaan in de app.

## Gebruiker ziet geen update?

1. Oud beginscherm-icoon verwijderen
2. Safari-cache wissen (Instellingen → Safari)
3. Link openen met `?v=` uit versielabel
4. Opnieuw op beginscherm zetten
